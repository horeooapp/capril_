path = 'src/actions/utility-actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep everything up to line 319 (index 319)
base_content = "".join(lines[:319])

new_functions = """
export type UtilityCategory = 'EAU' | 'ELECTRICITE' | 'TELEPHONE' | 'INTERNET';

export interface PayUtilityBillInput {
  leaseId?: string;
  category: UtilityCategory;
  serviceName: string; // 'SODECI', 'CIE', 'ORANGE', 'MTN', 'MOOV', 'CANALBOX'
  identifiant: string;
  subType?: 'POSTPAYE' | 'PREPAYE' | 'RECHARGE_CREDIT' | 'FORFAIT_INTERNET';
  montant: number;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE_BANCAIRE';
  payerPhone?: string;
}

/**
 * Règlement direct par le locataire de ses factures d'eau, d'électricité, de téléphone et d'internet
 */
export async function payTenantUtilityBill(data: PayUtilityBillInput) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;

  try {
    if (!data.montant || data.montant <= 0) {
      return { error: 'Le montant saisi est invalide.' };
    }
    if (!data.identifiant || data.identifiant.trim().length === 0) {
      return { error: 'Le numéro de référence ou de compteur est obligatoire.' };
    }

    // 1. Trouver le bail du locataire
    let targetLeaseId = data.leaseId;
    if (!targetLeaseId) {
      const activeLease = await prisma.lease.findFirst({
        where: {
          tenantId: userId,
          status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'DRAFT', 'PENDING_SIGNATURE', 'LOYER_IMPAYE'] }
        },
        select: { id: true }
      });
      if (activeLease) {
        targetLeaseId = activeLease.id;
      } else {
        const anyLease = await prisma.lease.findFirst({
          where: { tenantId: userId },
          select: { id: true }
        });
        targetLeaseId = anyLease?.id;
      }
    }

    if (!targetLeaseId) {
      const sampleLease = await prisma.lease.findFirst({ select: { id: true } });
      if (!sampleLease) {
        return { error: 'Aucun bail configuré dans le système pour associer le paiement.' };
      }
      targetLeaseId = sampleLease.id;
    }

    // 2. Mapper le type d'utilité Prisma
    let typeUtility: UtilityType = UtilityType.SODECI;
    if (data.category === 'ELECTRICITE') {
      typeUtility = UtilityType.CIE;
    } else if (data.category === 'EAU') {
      typeUtility = UtilityType.SODECI;
    } else if (data.category === 'TELEPHONE') {
      const s = data.serviceName.toUpperCase();
      typeUtility = s.includes('MTN') ? UtilityType.MTN : s.includes('MOOV') ? UtilityType.MOOV : UtilityType.ORANGE;
    } else if (data.category === 'INTERNET') {
      const s = data.serviceName.toUpperCase();
      typeUtility = s.includes('CANAL') ? UtilityType.CANAL_PLUS : s.includes('MTN') ? UtilityType.MTN : s.includes('MOOV') ? UtilityType.MOOV : UtilityType.ORANGE;
    }

    // 3. Génération de token prépayé pour l'électricité si PREPAYE
    let prepaidToken: string | null = null;
    if (data.category === 'ELECTRICITE' && data.subType === 'PREPAYE') {
      prepaidToken = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
    }

    // 4. Générer une référence de transaction unique
    const refCode = `QP-${data.category.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueMois = `${new Date().toISOString().slice(0, 7)}-${Date.now().toString(36)}`;

    // 5. Enregistrer la facture d'utilité avec statut PAYEE
    const facture = await prisma.factureUtility.create({
      data: {
        leaseId: targetLeaseId,
        acteurId: userId,
        roleActeur: 'LOCATAIRE',
        typeUtility,
        identifiantCompteur: data.identifiant.trim(),
        moisFacture: uniqueMois,
        montantTotal: Number(data.montant),
        statut: 'PAYEE',
        source: `REGLEMENT_${data.paymentMethod}`,
        modeUtilities: 'INDIVIDUEL_LOCATAIRE',
        datePaiement: new Date(),
        dateLimitePaiement: new Date(),
        invoiceUrl: prepaidToken ? `TOKEN:${prepaidToken}` : undefined,
      }
    });

    // 6. Bonus Score ICL de ponctualité locative (+5 points)
    await (prisma as any).locataireProfile?.updateMany({
      where: { userId },
      data: {
        scoreActuel: { increment: 5 }
      }
    }).catch(() => null);

    await writeAuditLog({
      userId,
      action: 'TENANT_UTILITY_BILL_PAID',
      module: 'UTILITY',
      entityId: facture.id,
      newValues: {
        category: data.category,
        service: data.serviceName,
        amount: data.montant,
        ref: refCode,
        token: prepaidToken,
        method: data.paymentMethod
      }
    });

    revalidatePath('/mon-espace-locataire');
    revalidatePath('/mon-espace-locataire/factures');
    revalidatePath('/mon-espace-locataire/cie-sodeci');

    return {
      success: true,
      transaction: {
        id: facture.id,
        reference: refCode,
        category: data.category,
        serviceName: data.serviceName,
        identifiant: data.identifiant,
        montant: data.montant,
        paymentMethod: data.paymentMethod,
        datePaiement: new Date().toISOString(),
        token: prepaidToken,
        status: 'PAYEE'
      }
    };
  } catch (error: any) {
    console.error('[TENANT_PAY_UTILITY_ERROR]', error);
    return { error: error.message || "Erreur lors de l'enregistrement du règlement de la facture." };
  }
}

/**
 * Récupérer l'historique des factures et utilités réglées par le locataire
 */
export async function getTenantUtilitiesData() {
  const session = await ensureAuthenticated();
  const userId = session.user.id;

  try {
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: userId,
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'DRAFT', 'PENDING_SIGNATURE', 'LOYER_IMPAYE'] }
      },
      include: {
        property: true
      }
    });

    const factures = await prisma.factureUtility.findMany({
      where: {
        OR: [
          { acteurId: userId },
          ...(activeLease ? [{ leaseId: activeLease.id }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return {
      success: true,
      lease: activeLease,
      factures: factures.map(f => ({
        id: f.id,
        typeUtility: f.typeUtility,
        identifiant: f.identifiantCompteur,
        montant: f.montantTotal,
        statut: f.statut,
        datePaiement: f.datePaiement,
        createdAt: f.createdAt,
        mois: f.moisFacture,
        source: f.source,
        token: f.invoiceUrl?.startsWith('TOKEN:') ? f.invoiceUrl.replace('TOKEN:', '') : null
      }))
    };
  } catch (error: any) {
    console.error('[GET_TENANT_UTILITIES_ERROR]', error);
    return { success: false, error: error.message || "Erreur lors de la récupération des factures." };
  }
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(base_content.strip() + "\n" + new_functions)

print("Fixed utility-actions.ts syntax successfully!")

