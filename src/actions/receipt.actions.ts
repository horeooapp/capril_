'use server'
// ═══════════════════════════════════════════════════════════════
// QAPRIL — Server Actions : Quittances (Receipt)
// Fichier : src/actions/receipt.actions.ts
//
// RÈGLES CRITIQUES :
//   RG-QUI-01 : Vérification droit d'émission
//   RG-QUI-02 : SHA-256 calculé côté serveur
//   RG-QUI-04 : Quittance mensuelle automatique
//   RG-QUI-05 : Seuils relance impayé
//   RG-QUI-07 : HMAC-SHA256 webhooks Mobile Money
//   RG-QUI-ORDRE : Ordre chronologique obligatoire
//   RG-CONF-01 : Bailleur réel jamais révélé au locataire
//   RG-ARC-01  : Certification ARC La Poste CI optionnelle
// ═══════════════════════════════════════════════════════════════

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
import {
  CreateReceiptDTO, formatMoisFR, genererQrUrl,
} from '../types/qapril-types';

// ── Émettre une quittance ────────────────────────────────────
export async function emettrequittance(dto: CreateReceiptDTO) {
  // const session = await auth();
  // if (!session?.user) throw new Error('Non authentifié');

  /* ── Logique Prisma ──

  return await prisma.$transaction(async (tx) => {

    // 1. Récupérer le bail actif
    const lease = await tx.lease.findFirst({
      where: { id: dto.leaseId, status: 'ACTIVE' },
      include: {
        property: true,
        tenant:   { select: { id: true, name: true, phone: true } },
      },
    });
    if (!lease) throw new Error('Bail introuvable ou non actif');

    // 2. Vérifier le droit d'émission · RG-QUI-01
    const droitEmission = await verifierDroitEmission(tx, session.user.id, lease.propertyId);
    if (!droitEmission) throw new Error(
      "Vous ne disposez pas du droit d'émission sur ce bien · RG-QUI-01"
    );

    // 3. ══════════════════════════════════════════════════════
    //    RÈGLE RG-QUI-ORDRE — Ordre chronologique obligatoire
    //    Vérifier qu'il n'existe aucun mois impayé antérieur
    // ═════════════════════════════════════════════════════════
    const moisAnterieurImpaye = await tx.receipt.findFirst({
      where: {
        leaseId:      dto.leaseId,
        moisConcerne: { lt: dto.moisConcerne },
        status:       { not: 'PAID' },
      },
      orderBy: { moisConcerne: 'asc' },
    });
    if (moisAnterieurImpaye) throw new Error(
      `Ordre chronologique non respecté · RG-QUI-ORDRE · `
      + `Le mois ${formatMoisFR(moisAnterieurImpaye.moisConcerne)} doit être réglé en premier.`
    );

    // 4. Vérifier unicité (une seule quittance PAID par bail par mois)
    const existante = await tx.receipt.findFirst({
      where: { leaseId: dto.leaseId, moisConcerne: dto.moisConcerne, status: 'PAID' },
    });
    if (existante) throw new Error(
      `Une quittance payée existe déjà pour ${formatMoisFR(dto.moisConcerne)}`
    );

    // 5. Générer la référence
    const moisStr = dto.moisConcerne.replace('-', '');
    const count   = await tx.receipt.count({ where: { moisConcerne: dto.moisConcerne } });
    const ref     = `QUI-${moisStr}-${String(count + 1).padStart(3, '0')}`;

    // 6. Calculer SHA-256 · RG-QUI-02
    // Calculé sur : tenantId + propertyId + montant + mois + date_emission + emetteurId
    const contenu = JSON.stringify({
      tenantId:      lease.tenantId,
      propertyId:    lease.propertyId,
      montant:       dto.amount,
      moisConcerne:  dto.moisConcerne,
      dateEmission:  new Date().toISOString(),
      emetteurId:    session.user.id,
    });
    const sha256Hash = createHash('sha256').update(contenu).digest('hex');
    const qrCodeUrl  = genererQrUrl(ref, sha256Hash);
    // Le QR code encode aussi le mois pour éviter toute falsification

    // 7. Créer la quittance
    const receipt = await tx.receipt.create({
      data: {
        reference:          ref,
        leaseId:            dto.leaseId,
        tenantId:           lease.tenantId,
        ownerId:            lease.ownerId,
        emetteurId:         session.user.id,
        amount:             dto.amount,
        rentAmount:         dto.rentAmount,
        chargesAmount:      dto.chargesAmount,
        paymentMethod:      dto.paymentMethod,
        paymentReference:   dto.paymentReference,
        moisConcerne:       dto.moisConcerne,
        dateEncaissement:   new Date(dto.dateEncaissement),
        sha256Hash,
        sha256CalculeLe:    new Date(),
        qrCodeUrl,
        flagWebhookNonRecu: dto.flagWebhookNonRecu ?? false,
        preuveUrl:          dto.preuveUrl,
        arcDemande:         dto.arcDemande ?? false,
        commentaireInterne: dto.commentaireInterne,
        status:             'PAID',
      },
    });

    // 8. Certification ARC si demandée · RG-ARC-01 à 03
    if (dto.arcDemande) {
      // Appel asynchrone non bloquant — ARC peut échouer sans bloquer la quittance
      arcCertifier(receipt.id, sha256Hash).catch(console.error);
    }

    // 9. Log audit · RG-ADD07-04 (traçabilité BCEAO)
    await tx.auditLog.create({
      data: {
        action:    'RECEIPT_CREATED',
        entityId:  receipt.id,
        userId:    session.user.id,
        meta:      {
          reference: ref,
          moisConcerne: dto.moisConcerne,
          montant: dto.amount,
          webhookNonRecu: dto.flagWebhookNonRecu ?? false,
        },
      },
    });

    // 10. Notification SMS locataire · RG-CONF-01
    // JAMAIS révéler le bailleur réel dans le SMS
    // await sendSmsQuittance({
    //   tenantPhone: lease.tenant.phone,
    //   tenantName:  lease.tenant.name,
    //   propertyName: lease.property.nomComplet,
    //   moisConcerne: dto.moisConcerne,
    //   montant: dto.amount,
    //   reference: ref,
    //   // ⚠ Ne pas inclure lease.ownerId ou owner.name · RG-CONF-01
    // });

    revalidatePath('/dashboard/owner');
    revalidatePath('/dashboard/agency');

    return receipt;
  });
  */

  return {
    success: true,
    reference: `QUI-${dto.moisConcerne.replace('-', '')}-001`,
    sha256Hash: 'a3f8c2d94e1b7a6f5029c8d3e4b1f7a6c2d9e0b3...',
    qrCodeUrl:  `https://qapril.ci/verifier?ref=QUI-202603-001&sha=a3f8c2d9...`,
  };
}

// ── Vérifier droit d'émission · RG-QUI-01 ────────────────────
async function verifierDroitEmission(tx: any, emetteurId: string, propertyId: string) {
  /* ── Logique Prisma ──

  // Cas 1 : bailleur direct
  const property = await tx.property.findUnique({ where: { id: propertyId } });
  if (property?.ownerId === emetteurId) return { role: 'BAILLEUR', nom: 'Bailleur direct' };

  // Cas 2 : agence agréée sous mandat · RG-MAN-01
  const mandat = await tx.mandate.findFirst({
    where: { propertyId, agencyId: emetteurId, status: 'ACTIVE', type: 'AGREED' },
  });
  if (mandat) return { role: 'AGENCE_AGREEE', nom: mandat.agencyName };

  // Cas 3 : délégation partielle avec droit quittance · RG-DEL-01
  const delegation = await tx.mandate.findFirst({
    where: { propertyId, delegateId: emetteurId, droitQuittance: true, status: 'ACTIVE' },
  });
  if (delegation) return { role: delegation.type, nom: delegation.delegateName };

  return null;
  */
  return { role: 'BAILLEUR', nom: 'Bailleur direct' };
}

// ── Certification ARC La Poste CI · RG-ARC-02 ────────────────
async function arcCertifier(receiptId: string, sha256: string) {
  /* ── Logique API La Poste CI ──
  const response = await fetch(process.env.ARC_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ARC_API_KEY}`,
    },
    body: JSON.stringify({ document_hash: sha256, document_id: receiptId }),
  });
  const { certification_id, timestamp } = await response.json();

  await prisma.receipt.update({
    where: { id: receiptId },
    data: {
      arcCertificationId: certification_id,
      arcHorodatage:      new Date(timestamp),
    },
  });
  */
}

// ── Lister les quittances d'un bail ───────────────────────────
export async function listerReceipts(leaseId?: string) {
  /* ── Logique Prisma ──
  const session = await auth();
  return await prisma.receipt.findMany({
    where: {
      ownerId: session.user.id,
      ...(leaseId ? { leaseId } : {}),
    },
    include: { lease: { include: { property: true } } },
    orderBy: [{ moisConcerne: 'desc' }, { createdAt: 'desc' }],
  });
  */
  return [];
}

// ── Premier mois impayé pour un bail (RG-QUI-ORDRE) ───────────
export async function getPremierMoisImpaye(leaseId: string): Promise<string | null> {
  /* ── Logique Prisma ──
  const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
  if (!lease) return null;

  // Générer tous les mois depuis le début du bail jusqu'à aujourd'hui
  const debut = new Date(lease.startDate);
  const now   = new Date();
  const mois: string[] = [];
  const cursor = new Date(debut.getFullYear(), debut.getMonth(), 1);

  while (cursor <= now) {
    mois.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Trouver les quittances déjà payées
  const payees = await prisma.receipt.findMany({
    where: { leaseId, status: 'PAID' },
    select: { moisConcerne: true },
  });
  const moisPayes = new Set(payees.map(r => r.moisConcerne));

  // Retourner le premier mois non payé dans l'ordre
  return mois.find(m => !moisPayes.has(m)) ?? null;
  */
  return '2026-03';
}
