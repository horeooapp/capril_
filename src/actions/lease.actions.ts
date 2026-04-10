"use server";
// QAPRIL — Server Actions Baux · Basé sur schema.prisma reçu
// Modèle : Lease · Champs exacts du schema

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";

// ── Créer un bail ────────────────────────────────────────
export async function createLease(data: {
  propertyId:    string;
  leaseType?:    string;
  landlordId:    string;
  tenantId?:     string;
  agentId?:      string;
  mandatGestionId?: string;
  startDate:     Date;
  endDate?:      Date;
  durationMonths: number;
  rentAmount:    number;   // Int FCFA
  chargesAmount?: number;  // Int FCFA
  paymentDay?:   number;   // défaut 5
  depositAmount?: number,  // Int FCFA
  avanceLoyer?: number,
  preavisRequisMois?: number,
  typeBail?:     string;   // "ECRIT" | "DECLARATIF_BDQ"
}) {
  try {
    const ref = `BAIL-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    // Calcul SHA-256 RG-BAIL-03
    const payload = JSON.stringify({
      ref, propertyId: data.propertyId, landlordId: data.landlordId,
      tenantId: data.tenantId, rentAmount: data.rentAmount,
      startDate: data.startDate, durationMonths: data.durationMonths
    });
    const sha256 = createHash("sha256").update(payload).digest("hex");

    // Facturation 2 000 FCFA — débiter wallet bailleur (gestion si le profil n'a pas encore de Wallet)
    const wallet = await (prisma as any).userWalletConfig.findUnique({
      where: { userId: data.landlordId }
    });

    if (!wallet) {
      await (prisma as any).userWalletConfig.create({
        data: { userId: data.landlordId, walletBalance: -2000 } // Débit autorisé car post-paiement possible ou solde négatif
      });
    } else {
      await (prisma as any).userWalletConfig.update({
        where: { userId: data.landlordId },
        data:  { walletBalance: { decrement: 2000 } }
      });
    }

    // Validation Loi n°2019-576 du 26 juin 2019 (Code de la Construction et de l'Habitat)
    const preavis = data.preavisRequisMois ?? 3;
    if (preavis < 3) {
        return { error: "Le préavis ne peut être inférieur à 3 mois (Arts. 440 et 442 CCH)." };
    }

    const maxLoyerAvanceCaution = data.rentAmount * 2;
    const avanceLoyer = data.avanceLoyer ?? 0;
    const depositAmount = data.depositAmount ?? 0;

    if (avanceLoyer > maxLoyerAvanceCaution) {
        return { error: `Avances illégales : max ${maxLoyerAvanceCaution.toLocaleString()} FCFA (Art. 415 CCH — 2 mois de loyer)` };
    }
    if (depositAmount > maxLoyerAvanceCaution) {
        return { error: `Dépôt de garantie illégal : max ${maxLoyerAvanceCaution.toLocaleString()} FCFA (Art. 416 CCH)` };
    }

    // Resolve True Landlord & Auto-assign Mandate if needed
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new Error("Bien introuvable.");

    let finalLandlordId = data.landlordId;
    let finalMandatId = data.mandatGestionId || null;

    if (data.agentId) { // Agent explicitly creating
        finalLandlordId = (property as any).ownerUserId; // fallback safety
        if (!finalMandatId) {
            const activeAccess = await (prisma as any).propertyAccess.findFirst({
                where: { propertyId: data.propertyId, userId: data.agentId, statut: "ACTIF" }
            });
            if (activeAccess) finalMandatId = activeAccess.mandatId || null;
        }
    }

    const deadlineDgi = new Date(data.startDate);
    deadlineDgi.setDate(deadlineDgi.getDate() + 30);

    const lease = await prisma.lease.create({
      data: {
        leaseReference: ref,
        leaseType:      data.leaseType,
        propertyId:     data.propertyId,
        landlordId:     finalLandlordId,
        tenantId:       data.tenantId || null,
        agentId:        data.agentId || null,
        mandatGestionId: finalMandatId,
        startDate:      data.startDate,
        endDate:        data.endDate,
        durationMonths: data.durationMonths,
        rentAmount:     data.rentAmount,
        chargesAmount:  data.chargesAmount ?? 0,
        paymentDay:     data.paymentDay    ?? 5,
        depositAmount:  depositAmount,
        avanceLoyer:    avanceLoyer,
        preavisRequisMois: preavis,
        typeBail:       data.typeBail      ?? ("ECRIT" as any),
        deadlineEnregistrement: deadlineDgi,
        status:         "DRAFT",
      }
    });

    revalidatePath("/dashboard");
    return { success: true, lease, sha256 };

  } catch (error: any) {
    console.error("Erreur serveur inattendue lors de la création du bail:", error);
    return { error: error.message || "Une erreur système inattendue s'est produite lors de la création du contrat." };
  }
}

// ── Récupérer les baux d'un bailleur ─────────────────────
export async function getLeasesForLandlord(landlordId: string) {
  return prisma.lease.findMany({
    where: { landlordId, status: { not: "ARCHIVED" } },
    include: {
      property: { select: { commune: true, address: true, propertyCode: true } },
      tenant:   { select: { firstName: true, lastName: true, phone: true } },
      receipts: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });
}

// ── Récupérer un bail par ID ──────────────────────────────
export async function getLeaseById(leaseId: string) {
  return prisma.lease.findUnique({
    where:   { id: leaseId },
    include: {
      property: true,
      landlord: { select: { firstName: true, lastName: true, phone: true, walletConfig: { select: { landlordCode: true } } } },
      tenant:   { select: { firstName: true, lastName: true, phone: true } },
      receipts: { orderBy: { createdAt: "desc" } }
    }
  });
}

// ── Récupérer les baux d'un locataire ────────────────────
export async function getLeasesForTenant(tenantId: string) {
  return prisma.lease.findMany({
    where: { tenantId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
    include: {
      property: { select: { commune: true, address: true, propertyCode: true } },
      receipts: { orderBy: { periodMonth: "desc" }, take: 6 }
    }
  });
}

// ── Compter baux actifs pour wallet ADD-07 v3 ────────────
export async function countActiveLeasesForLandlord(landlordId: string) {
  return prisma.lease.count({
    where: { landlordId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } }
  });
}

// ── Phase 2: Restitution de Caution (Conformité Loi 2019-576) ──
export async function enregistrerRestitutionCles(leaseId: string, dateRestitution: Date) {
  const deadline = new Date(dateRestitution);
  deadline.setDate(deadline.getDate() + 30);
  
  return prisma.cautionBail.update({
    where: { bailId: leaseId },
    data: {
      clesRestitueeAt: dateRestitution,
      deadlineRestitution: deadline,
      statutRestitution: "EN_ATTENTE"
    }
  });
}

// ── Phase 2: Préavis (Conformité Forclusion Art. 444) ──
export async function enregistrerEnvoiResiliation(preavisId: string, dateEnvoi: Date, modeEnvoi: string) {
  const deadline = new Date(dateEnvoi);
  deadline.setDate(deadline.getDate() + 30);
  
  return prisma.preavisBail.update({
    where: { id: preavisId },
    data: {
      lettreResiliationEnvoyeeAt: dateEnvoi,
      modeEnvoi,
      deadlineContestation: deadline,
      statut: "ENVOYE" as any
    }
  });
}

// ── Phase 2: Révision Loyer (Conformité Art. 423-424) ──
export async function validerRevisionLoyer(leaseId: string, dateEffet: Date) {
  const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
  if (!lease) throw new Error("Bail introuvable");
  
  const troisAnsAvant = new Date(dateEffet);
  troisAnsAvant.setFullYear(troisAnsAvant.getFullYear() - 3);

  if (lease.startDate > troisAnsAvant) {
      throw new Error("Loi 2019-576 (Art. 423) : La révision du loyer ne peut intervenir qu'après 3 ans de bail.");
  }

  const troisMoisAvant = new Date(dateEffet);
  troisMoisAvant.setMonth(troisMoisAvant.getMonth() - 3);
  
  const aujourdHui = new Date();
  if (aujourdHui > troisMoisAvant) {
      throw new Error("Loi 2019-576 (Art. 424) : Le préavis de révision doit être de 3 mois minimum avant la date d'effet.");
  }
  
  return true;
}

// ── Phase 3: État des Lieux Obligatoire (Conformité Art. 411 CCH) ──
export async function verifierEtatDesLieuxObligatoire(leaseId: string) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { inspections: true }
  });

  if (!lease) throw new Error("Bail introuvable");

  const hasEntryEdl = lease.inspections.some(insp => insp.type === "ENTRY" && insp.status !== "ANNULEE");
  
  if (!hasEntryEdl) {
    throw new Error("Loi 2019-576 (Art. 411) : Un état des lieux d'entrée est obligatoire pour formaliser ce bail.");
  }

  return true;
}
