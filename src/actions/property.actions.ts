"use server";
// QAPRIL - property.actions.ts - Gestion consolidée des biens
// Fusionne : properties.ts, property-actions.ts et property.actions.ts

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { serializeProperty, serializeLease } from "@/lib/serialize";
import { ensureAuthenticated, ensurePropertyAccess } from "./auth-helpers";
import { generatePropertyCode as generatePropertyCodeLegacy } from "@/lib/property";
import { generatePropertyCode, DEFAULT_CHECKLIST, PropertyValidationChecklist } from "@/lib/property-utils";

export type TypeStructure = "INDEPENDANT" | "COUR_COMMUNE" | "IMMEUBLE" | "RESIDENCE";

const COMMUNE_CODES: Record<string, string> = {
  "Cocody":       "COC",
  "Yopougon":     "YOP",
  "Abobo":        "ABO",
  "Adjame":       "ADJ",
  "Marcory":      "MAR",
  "Treichville":  "TRE",
  "Plateau":      "PLT",
  "Koumassi":     "KOU",
  "Anyama":       "ANY",
  "Bingerville":  "BIN",
};

const TYPE_PREFIXES: Record<TypeStructure, string> = {
  "INDEPENDANT":  "IND",
  "COUR_COMMUNE": "COU",
  "IMMEUBLE":     "IMM",
  "RESIDENCE":    "RES",
};

/**
 * [PRP-01] Liste les propriétés accessibles à l'utilisateur
 */
export async function getProperties() {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const fullUser = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { agencyConfig: true, capaciteActive: true, role: true } 
        });
        const managerId = (fullUser?.agencyConfig as any)?.managerId;
        const activeRole = fullUser?.capaciteActive || (session.user as any)?.chosenRole || fullUser?.role;

        let whereCondition: any;
        if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE'].includes(activeRole)) {
            whereCondition = { 
                ownerUserId: userId,
                status: { not: "archived" },
                deletedAt: null
            };
        } else {
            const orConditions: any[] = [
                { ownerUserId: userId },
                { managedByUserId: userId },
                { leases: { some: { landlordId: userId } } },
                { accessRoles: { some: { userId: userId, statut: "ACTIF" } } }
            ];

            if (managerId) {
                orConditions.push({ managedByUserId: managerId });
                orConditions.push({ leases: { some: { agentId: managerId } } });
                orConditions.push({ accessRoles: { some: { userId: managerId, statut: "ACTIF" } } });
            }
            whereCondition = { 
                OR: orConditions,
                status: { not: "archived" },
                deletedAt: null
            };
        }

        const dbProperties = await prisma.property.findMany({
            where: whereCondition,
            include: {
                annonces: true,
                units: {
                    where: {
                        status: { not: "archived" },
                        deletedAt: null
                    },
                    include: {
                        annonces: true,
                        leases: {
                            include: {
                                tenant: { select: { firstName: true, lastName: true, phone: true } }
                            }
                        }
                    }
                },
                parentProperty: true,
                leases: {
                    include: {
                        tenant: { select: { firstName: true, lastName: true, phone: true } },
                        receipts: { orderBy: { paidAt: 'desc' }, take: 10 },
                        cdcDeposits: true,
                        reclamations: { where: { statut: { in: ['OUVERT', 'EN_COURS'] } } },
                        dossiersLitige: { where: { statut: { in: ['GENERE', 'TRANSMIS_CACI', 'MEDIATION_EN_COURS'] } } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return dbProperties.map(serializeProperty);
    } catch (error) {
        console.error("[ACTION] getProperties error:", error);
        return [];
    }
}

import { savePhysicalFile } from "@/lib/storage";

export async function creerBien(formData: FormData) {
  try {
    const session = await ensureAuthenticated();
    const ownerUserId = (formData.get("ownerUserId") as string) || session.user.id;
    
    const data = {
        typeStructure: formData.get("typeStructure") as TypeStructure,
        name: formData.get("name") as string,
        unitLabel: formData.get("unitLabel") as string,
        parentPropertyId: formData.get("parentPropertyId") as string,
        commune: formData.get("commune") as string,
        address: formData.get("addressLine1") as string || formData.get("address") as string,
        propertyType: (formData.get("propertyType") as string) || "BUILDING",
        declaredRentFcfa: parseInt(formData.get("rent") as string) || 0,
        superficieM2: parseFloat(formData.get("area") as string) || undefined,
        nbUnits: parseInt(formData.get("nbUnits") as string) || 0,
        unitRent: parseInt(formData.get("unitRent") as string) || 0,
        leaseType: (formData.get("leaseType") as any) || "residential",
    }

    const { typeStructure, unitLabel, parentPropertyId, nbUnits, unitRent } = data;
    
    // Get images from formData
    const imageFiles = formData.getAll("images") as File[];

    // Checks PRO/AGENCY
    const isPro = ['AGENCY', 'LANDLORD_PRO'].includes(session.user.role as any);
    const userKyc = await prisma.user.findUnique({ where: { id: ownerUserId }, select: { kycLevel: true } });
    if (isPro && (userKyc?.kycLevel || 0) < 4) throw new Error("KYC niveau 4 requis pour les comptes PRO.");
    if (!isPro && (userKyc?.kycLevel || 0) < 2) throw new Error("KYC niveau 2 requis pour enregistrer des biens.");

    return await prisma.$transaction(async (tx) => {
      // 1. Validation hiérarchie
      if (typeStructure !== "INDEPENDANT") {
        if (!unitLabel?.trim() && parentPropertyId) throw new Error(`Nom de l'unité obligatoire pour un bien enfant`);
        if (!parentPropertyId && !["COUR_COMMUNE", "IMMEUBLE", "RESIDENCE"].includes(typeStructure)) throw new Error(`Structure parente obligatoire`);
      }

      // 2. Unicité du label au sein d'une structure
      if (unitLabel && parentPropertyId) {
        const existant = await tx.property.findFirst({
           where: { parentPropertyId, unitLabel: { mode: 'insensitive', equals: unitLabel.trim() } }
        });
        if (existant) throw new Error(`L'unite "${unitLabel}" existe deja.`);
      }

      // 3. Récupération héritage parent
      let inheritedData: any = {};
      let parentRef: string | undefined;
      if (parentPropertyId) {
        const parent = await tx.property.findUnique({ where: { id: parentPropertyId } });
        if (!parent) throw new Error("Parent introuvable");
        parentRef = parent.propertyCode;
        inheritedData = {
          commune: parent.commune,
          address: parent.address,
          city: parent.city,
          leaseType: parent.leaseType,
          managedByUserId: parent.managedByUserId,
          managementMode: parent.managementMode,
        };
      }

      // 4. Génération du code
      const seq = await tx.property.count({ where: { commune: data.commune || inheritedData.commune } });
      const propertyCode = generatePropertyCode((data.leaseType || inheritedData.leaseType || 'residential') as any, data.commune || inheritedData.commune, seq + 1);

      // 5. Création
      const bien = await tx.property.create({
        data: {
          propertyCode: (parentPropertyId && unitLabel && parentRef) 
            ? `${parentRef}-${unitLabel.replace(/\s/g, '').toUpperCase()}` 
            : propertyCode,
          ownerUserId,
          typeStructure,
          name:             data.name || (parentPropertyId && unitLabel ? `${inheritedData.name || ''} - ${unitLabel}` : data.name),
          unitLabel:        unitLabel ? unitLabel.trim() : undefined,
          parentPropertyId: data.parentPropertyId,
          commune:          data.commune || inheritedData.commune,
          address:          data.address || inheritedData.address,
          leaseType:        data.leaseType || inheritedData.leaseType || "residential",
          propertyType:     data.propertyType,
          declaredRentFcfa: data.declaredRentFcfa,
          superficieM2:     data.superficieM2,
          status:           "active"
        }
      });

      // 5b. Gestion des images
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          if (file && file.size > 0) {
            try {
              const url = await savePhysicalFile(file, "properties");
              await tx.propertyImage.create({
                data: {
                  propertyId: bien.id,
                  s3Key: url,
                  isMain: i === 0
                }
              });
            } catch (err) {
              console.error("Failed to save image:", err);
            }
          }
        }
      }

      // 6. Bulk creation si nécessaire
      if (nbUnits && nbUnits > 0 && typeStructure !== 'INDEPENDANT') {
        const prefix = typeStructure === 'IMMEUBLE' ? 'Apt' : 'Porte';
        for (let i = 1; i <= nbUnits; i++) {
           const childLabel = `${prefix} ${i}`;
           await tx.property.create({
             data: {
               propertyCode: `${propertyCode}-${childLabel.replace(/\s/g, '').toUpperCase()}`,
               ownerUserId,
               typeStructure,
               name: `${bien.name} - ${childLabel}`,
               unitLabel: childLabel,
               parentPropertyId: bien.id,
               commune: bien.commune,
               address: bien.address,
               leaseType: bien.leaseType,
               propertyType: typeStructure === 'IMMEUBLE' ? 'APARTMENT' : 'ROOM',
               declaredRentFcfa: unitRent,
               status: "ACTIVE"
             }
           });
        }
      }

      revalidatePath("/dashboard/properties");
      return { success: true, bien: serializeProperty(bien) };
    });
  } catch (error: any) {
    console.error("[créerBien Error]:", error);
    return { error: error.message || "Erreur lors de la création." };
  }
}

/**
 * [PRP-03] Récupère un bien par son ID
 */
export async function getPropertyById(id: string) {
    try {
        await ensurePropertyAccess(id);
        const property = await prisma.property.findUnique({
            where: { id },
            include: { 
                images: true,
                leases: { include: { tenant: { select: { firstName: true, lastName: true, phone: true } } } } 
            }
        });
        if (!property || property.status === "archived" || property.deletedAt) return null;
        return serializeProperty(property);
    } catch (error) {
        console.error("[ACTION] getPropertyById error:", error);
        return null;
    }
}

/**
 * [PRP-04] Récupère le passeport complet d'un bien
 */
export async function getPropertyPassport(id: string) {
    try {
        await ensurePropertyAccess(id);
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } }
                    },
                    orderBy: { startDate: 'desc' }
                },
                maintenanceRecords: true,
                technicalDocuments: true
            }
        });

        if (!property) return null;

        const serialized = serializeProperty(property);
        return {
            ...serialized,
            addressLine1: property.address, // UI compatibility
            type: property.propertyType, // UI compatibility
            surface: property.superficieM2, // UI compatibility
        };
    } catch (error) {
        console.error("[ACTION] getPropertyPassport error:", error);
        return null;
    }
}

/**
 * [PRP-05] Validation ANAH / Agent
 */
export async function validateProperty(propertyId: string, checklist: PropertyValidationChecklist, action: 'approve' | 'reject') {
    try {
        const session = await ensureAuthenticated();
        if (!([Role.ADMIN, Role.SUPER_ADMIN, Role.ANAH_AGENT] as Role[]).includes(session.user.role as Role)) throw new Error("Non autorisé.");

        const isApproved = action === 'approve';
        await prisma.$transaction(async (tx) => {
            const property = await tx.property.update({
                where: { id: propertyId },
                data: {
                    status: isApproved ? 'active' : 'rejected',
                    verifiedAt: isApproved ? new Date() : null,
                    verifiedByUserId: session.user.id,
                    documents: checklist as any
                }
            });

            if (isApproved) {
                await tx.passport.create({
                    data: {
                        propertyId: property.id,
                        content: { initialState: "verified", validationChecklist: checklist, activationDate: new Date().toISOString() }
                    }
                });
            }
        });

        revalidatePath("/admin/properties");
        return { success: true };
    } catch (error) {
        console.error("Erreur validation bien:", error);
        return { error: "Erreur lors de la validation." };
    }
}

/**
 * [PRP-06] Modifier un bien immobilier
 * RÈGLE : Aucun bien en location active ne peut être modifié.
 */
export async function modifierBien(propertyId: string, formData: FormData) {
  try {
    const session = await ensureAuthenticated();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          where: { status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] } }
        },
        units: {
          include: {
            leases: { where: { status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] } } }
          }
        }
      }
    });

    if (!property) return { error: "Bien introuvable." };
    if (property.ownerUserId !== session.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as any)) {
      return { error: "Non autorisé : vous n'êtes pas le propriétaire de ce bien." };
    }

    // VÉRIFICATION BIEN EN LOCATION
    const hasActiveLease = property.leases.length > 0 || property.status === 'rented' || property.status === 'RENTED';
    const childHasActiveLease = property.units.some(u => u.leases.length > 0 || u.status === 'rented' || u.status === 'RENTED');

    if (hasActiveLease || childHasActiveLease) {
      return { 
        error: "Action impossible : Ce bien est actuellement sous contrat de location (ou en cours de contractualisation). Aucun bien loué ne peut être modifié." 
      };
    }

    const name = formData.get("name") as string;
    const unitLabel = formData.get("unitLabel") as string;
    const address = (formData.get("addressLine1") as string) || (formData.get("address") as string);
    const commune = formData.get("commune") as string;
    const rent = parseInt(formData.get("rent") as string);
    const area = parseFloat(formData.get("area") as string);
    const propertyType = formData.get("propertyType") as string;

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: name || undefined,
        unitLabel: unitLabel || undefined,
        address: address || undefined,
        commune: commune || undefined,
        declaredRentFcfa: !isNaN(rent) ? rent : undefined,
        superficieM2: !isNaN(area) ? area : undefined,
        propertyType: propertyType || undefined,
      }
    });

    // Mettre à jour l'annonce associée si présente
    if (name || rent) {
      await prisma.annonce.updateMany({
        where: { logementId: propertyId },
        data: {
          titre: name || undefined,
          loyerDemande: !isNaN(rent) ? rent : undefined
        }
      }).catch(() => null);
    }

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${propertyId}`);
    return { success: true, bien: serializeProperty(updated) };
  } catch (error: any) {
    console.error("[modifierBien Error]:", error);
    return { error: error.message || "Erreur lors de la modification du bien." };
  }
}

/**
 * [PRP-07] Supprimer un bien immobilier
 * RÈGLE : Aucun bien en location active ne peut être supprimé.
 */
export async function supprimerBien(propertyId: string) {
  try {
    const session = await ensureAuthenticated();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          where: { status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] } }
        },
        units: {
          include: {
            leases: { where: { status: { in: ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] } } }
          }
        }
      }
    });

    if (!property) return { error: "Bien introuvable." };
    if (property.ownerUserId !== session.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as any)) {
      return { error: "Non autorisé : vous n'êtes pas le propriétaire de ce bien." };
    }

    // VÉRIFICATION BIEN EN LOCATION
    const hasActiveLease = property.leases.length > 0 || property.status === 'rented' || property.status === 'RENTED';
    const childHasActiveLease = property.units.some(u => u.leases.length > 0 || u.status === 'rented' || u.status === 'RENTED');

    if (hasActiveLease || childHasActiveLease) {
      return { 
        error: "Action impossible : Ce bien est actuellement sous contrat de location (ou en attente de signature). Aucun bien loué ne peut être supprimé." 
      };
    }

    // Archivage / Suppression douce du bien et de ses annonces
    await prisma.$transaction(async (tx) => {
      // Désactiver toutes les annonces
      await tx.annonce.updateMany({
        where: { logementId: propertyId },
        data: { statut: "ARCHIVEE", archiveeAt: new Date() }
      });

      // Supprimer ou archiver les unités enfants si structure parente
      if (property.units.length > 0) {
        for (const unit of property.units) {
          await tx.annonce.updateMany({
            where: { logementId: unit.id },
            data: { statut: "ARCHIVEE", archiveeAt: new Date() }
          });
          await tx.property.update({
            where: { id: unit.id },
            data: { status: "archived", deletedAt: new Date() }
          });
        }
      }

      // Marquer le bien comme archivé/supprimé
      await tx.property.update({
        where: { id: propertyId },
        data: { status: "archived", deletedAt: new Date() }
      });
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    revalidatePath("/mon-espace-locataire/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("[supprimerBien Error]:", error);
    return { error: error.message || "Erreur lors de la suppression du bien." };
  }
}

/**
 * [PRP-06 Legacy] Retrait d'un bien (Soft Delete + Notifications)
 */
export async function retirerProperty(propertyId: string) {
  return supprimerBien(propertyId);
}

export async function formaterAdresseBien(bien: any): Promise<string> {
  const parts: string[] = [];
  if (bien.parentProperty?.name) parts.push(bien.parentProperty.name);
  if (bien.unitLabel) parts.push(bien.unitLabel);
  else if (bien.name) parts.push(bien.name);
  parts.push(bien.address);
  parts.push(bien.commune);
  return parts.join(" · ");
}

export async function getBiensPortefeuille(ownerUserId: string) {
  return prisma.property.findMany({
    where: { ownerUserId, parentPropertyId: null, status: { not: "archived" } },
    include: { units: true, leases: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getMyParentStructures() {
  const session = await ensureAuthenticated();
  return prisma.property.findMany({
    where: { ownerUserId: session.user.id, typeStructure: { in: ["COUR_COMMUNE", "IMMEUBLE", "RESIDENCE"] }, status: { not: "archived" } },
    select: { id: true, name: true, typeStructure: true, propertyCode: true, commune: true, address: true },
    orderBy: { createdAt: "desc" }
  });
}
