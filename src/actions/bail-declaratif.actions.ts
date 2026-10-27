"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { serializeObject } from "@/lib/serialize"

export interface BailDeclaratifData {
  tenantFullName: string
  tenantPhone:    string
  commune:        string
  address:        string
  rentAmount:     number
  paymentDay:     number
  startDate:      string // YYYY-MM-DD
  propertyId?:    string // Si bien deja cree
}

// Normaliser le numero de telephone CI
function normaliserTelephone(phone: string): string {
  if (!phone) return "";
  const digits = String(phone).replace(/[^0-9]/g, "")
  if (digits.startsWith("225")) return "+" + digits
  if (digits.length === 10) return "+225" + digits
  if (digits.length === 8) return "+225" + "0" + digits
  return "+" + digits
}

function genRef(prefix: string, commune?: string): string {
  const year   = new Date().getFullYear()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  if (commune) {
    const cc = commune.slice(0, 3).toUpperCase()
    return `${prefix}-${cc}-${year}-${random}`
  }
  return `${prefix}-${year}-${random}`
}

export async function creerBailDeclaratif(
  ownerUserId: string,
  data: BailDeclaratifData
) {
  try {
  if (!data.tenantFullName?.trim()) return { error: "Nom du locataire requis" }
  if (!data.tenantPhone)            return { error: "Numéro de téléphone requis" }
  if (!data.commune?.trim())        return { error: "Commune requise" }
  if (!data.address?.trim())        return { error: "Adresse requise" }
  if (!data.rentAmount || data.rentAmount <= 0) return { error: "Montant loyer invalide" }
  if (!data.startDate)              return { error: "Date de début requise" }

  const phoneNorm = normaliserTelephone(data.tenantPhone)
  if (!phoneNorm)                   return { error: "Format du téléphone invalide" }

  // 1. Trouver ou creer le locataire
  let tenant = await prisma.user.findFirst({
    where: { phone: phoneNorm }
  })

  if (!tenant) {
    tenant = await prisma.user.create({
      data: {
        phone:    phoneNorm,
        firstName: data.tenantFullName.split(' ')[0] || '',
        lastName: data.tenantFullName.split(' ').slice(1).join(' ') || '',
        role:     "TENANT",
        status:   "ACTIVE",
        onboardingComplete: false,
      }
    })
  }

  // 2. Utiliser le bien fourni ou creer un bien declaratif
  let propertyId = data.propertyId

  if (!propertyId) {
    // Generer une reference declarative
    const propertyCode = genRef("IND", data.commune)

    const property = await prisma.property.create({
      data: {
        propertyCode,
        ownerUserId:   ownerUserId,
        typeStructure: "INDEPENDANT",
        commune:       data.commune,
        address:       data.address,
        propertyType:  "Appartement",
        status:        "ACTIVE"
      }
    })
    propertyId = property.id
  }

  // 3. Generer la reference du bail
  const leaseReference = genRef("BDQ")

  // 4. Creer le bail declaratif (Lease)
  const bail = await prisma.lease.create({
    data: {
      leaseReference,
      tenantId:       tenant.id,
      landlordId:     ownerUserId, // Prerequisite for LeaseUncheckedCreateInput
      propertyId:     propertyId,
      typeBail:       "DECLARATIF_BDQ",
      rentAmount:     Number(data.rentAmount) || 0,
      durationMonths: 0,          // Option A: 0 = durée libre
      chargesAmount:  0,
      paymentDay:     Number(data.paymentDay) || 5,
      startDate:      new Date(data.startDate),
      status:         "ACTIVE_DECLARATIF",
      modeCreation:   "DECLARATIF",
    }
  })

  // 4bis. Creer le BailDeclaratif et lier au Lease
  const bdq = await prisma.bailDeclaratif.create({
    data: {
      bailleurId:          ownerUserId,
      propertyId:          propertyId,
      telephoneLocataire:  phoneNorm,
      nomLocataireDeclare: data.tenantFullName,
      loyerDeclareMensuel: Number(data.rentAmount) || 0,
      dateEntreeEstimee:   new Date(data.startDate),
      statut:              "PENDING_LOCATAIRE",
      sourceCreation:      "IA_CHAT",
      descriptionLogement: data.address,
      hashDeclaration:     "GENERATED_FROM_ACTION",
      bailFormelId:        bail.id
    }
  })

  // 5. Envoyer SMS invitation au locataire
  console.log(`[BDQ] Bail cree ${leaseReference} - Inviter ${phoneNorm}`)

  revalidatePath("/dashboard/leases")
  return serializeObject({ success: true, bail, bdq, tenant })
  } catch (err: any) {
    console.error("[BDQ_CREATE_ERROR]", err);
    return { error: err.message || "Erreur interne lors de la création du bail" };
  }
}

export interface UpdateBailDeclaratifData {
  bdqId: string;
  nomLocataire: string;
  prenomLocataire?: string;
  telephoneLocataire: string;
  loyerDeclareMensuel: number;
  descriptionLogement?: string;
  adresseLibre?: string;
  dateEntreeEstimee?: string | Date | null;
  propertyId?: string | null;
}

/**
 * Modifier un bail déclaratif (BDQ)
 */
export async function modifierBailDeclaratif(data: UpdateBailDeclaratifData) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Vous devez être connecté pour modifier ce bail." };
    }
    const userId = session.user.id;
    const userRole = (session.user as any)?.role;

    if (!data.bdqId) return { success: false, error: "Identifiant du bail manquant." };
    if (!data.nomLocataire?.trim()) return { success: false, error: "Le nom du locataire est obligatoire." };
    if (!data.telephoneLocataire?.trim()) return { success: false, error: "Le numéro de téléphone est obligatoire." };
    if (!data.loyerDeclareMensuel || Number(data.loyerDeclareMensuel) <= 0) {
      return { success: false, error: "Le montant du loyer mensuel doit être supérieur à zéro." };
    }

    const bdq = await prisma.bailDeclaratif.findUnique({
      where: { id: data.bdqId },
      include: { property: true }
    });

    if (!bdq) return { success: false, error: "Ce bail déclaratif est introuvable." };
    if (bdq.bailleurId !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return { success: false, error: "Vous n'avez pas l'autorisation de modifier ce bail." };
    }

    const phoneNorm = normaliserTelephone(data.telephoneLocataire);

    // Historique de loyer si montant modifié
    if (Number(data.loyerDeclareMensuel) !== Number(bdq.loyerDeclareMensuel)) {
      await prisma.bdqHistoriqueLoyer.create({
        data: {
          bdqId: bdq.id,
          ancienLoyer: bdq.loyerDeclareMensuel,
          nouveauLoyer: Number(data.loyerDeclareMensuel),
          motif: "Ajustement des termes du bail déclaratif par le bailleur",
          effectiveLe: new Date(),
          hashModification: `MODIF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          modifieParId: userId,
        }
      }).catch(() => null);
    }

    // Mise à jour de BailDeclaratif
    const updatedBdq = await prisma.bailDeclaratif.update({
      where: { id: data.bdqId },
      data: {
        nomLocataireDeclare: data.nomLocataire.trim(),
        prenomLocataireDeclare: data.prenomLocataire?.trim() || null,
        telephoneLocataire: phoneNorm,
        loyerDeclareMensuel: Number(data.loyerDeclareMensuel),
        descriptionLogement: data.descriptionLogement?.trim() || bdq.descriptionLogement,
        adresseLibre: data.adresseLibre?.trim() || bdq.adresseLibre,
        dateEntreeEstimee: data.dateEntreeEstimee ? new Date(data.dateEntreeEstimee) : bdq.dateEntreeEstimee,
        propertyId: data.propertyId !== undefined ? (data.propertyId || null) : bdq.propertyId,
        updatedAt: new Date(),
      }
    });

    // Synchronisation si bail formel lié
    if (bdq.bailFormelId) {
      await prisma.lease.update({
        where: { id: bdq.bailFormelId },
        data: {
          rentAmount: Number(data.loyerDeclareMensuel),
          startDate: data.dateEntreeEstimee ? new Date(data.dateEntreeEstimee) : undefined,
          propertyId: data.propertyId || undefined,
        }
      }).catch(() => null);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "BDQ_UPDATE",
        module: "LEASES",
        entityId: data.bdqId,
        newValues: {
          nom: data.nomLocataire,
          tel: phoneNorm,
          loyer: data.loyerDeclareMensuel,
          dateEntree: data.dateEntreeEstimee,
          propertyId: data.propertyId
        }
      }
    }).catch(() => null);

    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/leases/${data.bdqId}`);
    return serializeObject({
      success: true,
      message: "Le bail déclaratif a été mis à jour avec succès.",
      bdq: updatedBdq
    });
  } catch (err: any) {
    console.error("[BDQ_UPDATE_ERROR]", err);
    return { success: false, error: err.message || "Erreur lors de la modification du bail déclaratif." };
  }
}

/**
 * Supprimer / Archiver un bail déclaratif (BDQ)
 */
export async function supprimerBailDeclaratif(bdqId: string) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Vous devez être connecté pour supprimer ce bail." };
    }
    const userId = session.user.id;
    const userRole = (session.user as any)?.role;

    const bdq = await prisma.bailDeclaratif.findUnique({
      where: { id: bdqId },
      include: { property: true }
    });

    if (!bdq) {
      return { success: false, error: "Ce bail déclaratif est introuvable." };
    }

    if (bdq.bailleurId !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return { success: false, error: "Vous n'avez pas l'autorisation de supprimer ce bail." };
    }

    // 1. Archiver le BailDeclaratif
    await prisma.bailDeclaratif.update({
      where: { id: bdqId },
      data: {
        statut: "ARCHIVE",
        deletedAt: new Date()
      }
    });

    // 2. Archiver le Lease associé si existant
    if (bdq.bailFormelId) {
      await prisma.lease.update({
        where: { id: bdq.bailFormelId },
        data: { status: "ARCHIVED" }
      }).catch(() => null);
    }

    // 3. Libérer le bien si aucun autre bail actif n'est en cours
    if (bdq.propertyId) {
      const otherActive = await prisma.lease.findFirst({
        where: {
          propertyId: bdq.propertyId,
          status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] },
          id: { not: bdq.bailFormelId || "" }
        }
      });
      if (!otherActive) {
        await prisma.property.update({
          where: { id: bdq.propertyId },
          data: { status: "ACTIVE" }
        }).catch(() => null);
      }
    }

    // 4. Clore toute médiation ouverte liée au BDQ
    await prisma.mediation.updateMany({
      where: { bdqId, status: "OPEN" },
      data: {
        status: "RESOLVED",
        resolutionNotes: "Bail déclaratif supprimé / annulé par le bailleur."
      }
    }).catch(() => null);

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "BDQ_DELETE",
        module: "LEASES",
        entityId: bdqId,
        newValues: { statut: "ARCHIVE" }
      }
    }).catch(() => null);

    revalidatePath("/dashboard/leases");
    return { success: true, message: "Le bail déclaratif a été supprimé avec succès." };
  } catch (err: any) {
    console.error("[BDQ_DELETE_ERROR]", err);
    return { success: false, error: err.message || "Erreur lors de la suppression du bail." };
  }
}

// Aliases
export const updateBDQAction = modifierBailDeclaratif;
export const deleteBDQAction = supprimerBailDeclaratif;

