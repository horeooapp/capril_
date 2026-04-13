"use server"

import { prisma } from "@/lib/prisma"
import { generatePropertyCode } from "@/lib/property"
import { revalidatePath } from "next/cache"
import { serializeProperty, serializeLease, serializeObject } from "@/lib/serialize"
import { ensureAuthenticated, ensurePropertyAccess } from "./auth-helpers"
import { Role } from "@prisma/client"

/**
 * Part 5: List Owner Properties
 */
export async function getProperties() {
    try {
        const session = await ensureAuthenticated()
        const userId = session.user.id

        const fullUser = await prisma.user.findUnique({ where: { id: userId }, select: { agencyConfig: true } })
        const managerId = (fullUser?.agencyConfig as any)?.managerId

        const orConditions: any[] = [
            { ownerUserId: userId },
            { managedByUserId: userId },
            { leases: { some: { landlordId: userId } } },
            { accessRoles: { some: { userId: userId, statut: "ACTIF" } } }
        ]

        if (managerId) {
            orConditions.push({ managedByUserId: managerId })
            orConditions.push({ leases: { some: { agentId: managerId } } })
            orConditions.push({ accessRoles: { some: { userId: managerId, statut: "ACTIF" } } })
        }

        const dbProperties = await prisma.property.findMany({
            where: {
                OR: orConditions
            },
            include: {
                units: {
                    include: {
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
                        receipts: {
                            orderBy: { paidAt: 'desc' },
                            take: 10
                        },
                        cdcDeposits: true,
                        reclamations: {
                            where: { statut: { in: ['OUVERT', 'EN_COURS'] } }
                        },
                        dossiersLitige: {
                            where: { statut: { in: ['GENERE', 'TRANSMIS_CACI', 'MEDIATION_EN_COURS'] } }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const properties = [...dbProperties] as any[];

        const leaseOrConditions: any[] = [
            { landlordId: userId },
            { agentId: userId }
        ]
        if (managerId) {
            leaseOrConditions.push({ agentId: managerId })
        }

        const directLeases = await prisma.lease.findMany({
            where: { OR: leaseOrConditions },
            include: {
                property: true,
                tenant: { select: { firstName: true, lastName: true, phone: true } },
                receipts: {
                    orderBy: { paidAt: 'desc' },
                    take: 10
                },
                cdcDeposits: true,
                reclamations: {
                    where: { statut: { in: ['OUVERT', 'EN_COURS'] } }
                },
                dossiersLitige: {
                    where: { statut: { in: ['GENERE', 'TRANSMIS_CACI', 'MEDIATION_EN_COURS'] } }
                }
            }
        });

        const existingPropertyIds = new Set(properties.map(p => p.id));
        for (const lease of directLeases) {
            if (!existingPropertyIds.has(lease.propertyId)) {
                const prop = {
                    ...lease.property,
                    leases: [lease]
                };
                properties.push(prop);
                existingPropertyIds.add(lease.propertyId);
            } else {
                const prop = properties.find((p: any) => p.id === lease.propertyId);
                if (prop && Array.isArray(prop.leases)) {
                    if (!prop.leases.some((l: any) => l.id === lease.id)) {
                        prop.leases.push(lease);
                    }
                }
            }
        }

        return properties.map(serializeProperty)
    } catch (error) {
        console.error("[ACTION] getProperties error:", error)
        return []
    }
}

/**
 * Part 5: Register Property
 */
export async function registerProperty(data: {
    leaseType: 'residential' | 'commercial',
    address: string,
    commune: string,
    declaredRentFcfa: number,
    propertyType: string,
    rooms?: number,
    superficieM2?: number
}) {
    const session = await ensureAuthenticated()
    const userId = session.user.id

    try {
        const propertyCode = await generatePropertyCode(data.leaseType)

        const property = await prisma.property.create({
            data: {
                propertyCode,
                leaseType: data.leaseType,
                ownerUserId: session.user.id,
                address: data.address,
                commune: data.commune,
                declaredRentFcfa: data.declaredRentFcfa,
                propertyType: data.propertyType,
                rooms: data.rooms,
                superficieM2: data.superficieM2,
                status: 'active'
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/properties")
        
        return { success: true, propertyCode: property.propertyCode }
    } catch (error) {
        console.error("[SERVER ACTION] Error registering property:", error)
        return { error: "Impossible d'enregistrer la propriété." }
    }
}

/**
 * Part 5: Get Property Details
 */
export async function getPropertyById(id: string) {
    try {
        await ensurePropertyAccess(id)

        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        tenant: {
                            select: { firstName: true, lastName: true, phone: true }
                        }
                    }
                }
            }
        })

        if (!property) return null

        return serializeProperty(property)
    } catch (error) {
        console.error("[ACTION] getPropertyById error:", error)
        return null
    }
}

/**
 * Part 6.3: Get Property Passport (Digital Identity)
 */
export async function getPropertyPassport(id: string) {
    try {
        await ensurePropertyAccess(id)

        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        tenant: {
                            select: { firstName: true, lastName: true, email: true }
                        },
                        incidentLogs: true
                    },
                    orderBy: { startDate: 'desc' }
                },
                maintenanceRecords: {
                    orderBy: { date: 'desc' }
                },
                technicalDocuments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!property) return null

        // Transform for UI (Passport page expects specific names)
        const serialized = serializeProperty(property);
        return {
            ...serialized,
            type: (property as any).propertyType,
            surface: (property as any).superficieM2 ? Number((property as any).superficieM2) : null,
            leases: (property.leases || []).map((lease: any) => ({
                ...serializeLease(lease),
                tenant: lease.tenant ? {
                    name: (lease.tenant.firstName ? lease.tenant.firstName + " " : "") + (lease.tenant.lastName || "") || lease.tenant.email || "Inconnu",
                    email: lease.tenant.email
                } : { name: "Inconnu", email: null },
                incidents: (lease.incidentLogs || []).map((inc: any) => ({
                    id: inc.id,
                    type: inc.type,
                    severity: inc.severity,
                    description: inc.description,
                    createdAt: inc.createdAt
                }))
            }))
        }
    } catch (error) {
        console.error("[ACTION] getPropertyPassport error:", error)
        return null
    }
}

// ==========================================
// CORRECTIF C-09 : HIERARCHIE ET REFERENCES
// ==========================================

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

function normaliserSuffixe(label: string): string {
  return label.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function normaliserLabel(label: string): string {
  return label.trim().replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

async function genererReference(type: TypeStructure, commune: string, unitLabel?: string, parentRef?: string): Promise<string> {
  const prefix = TYPE_PREFIXES[type];
  const communeCode = COMMUNE_CODES[commune] ?? commune.slice(0,3).toUpperCase();
  const annee = new Date().getFullYear();

  // On vérifie d'abord les enfants car leur Ref est déduite du parent
  if (type !== "INDEPENDANT" && parentRef && unitLabel) {
    const suffixe = normaliserSuffixe(unitLabel);
    return `${parentRef}-${suffixe}`;
  }

  const count = await prisma.property.count();
  let seqNumber = count + 1;
  let refBase = "";
  let isUnique = false;

  // Boucle pour contourner les conflits de séquence (ex: suppression logique)
  while (!isUnique) {
    const seq = String(seqNumber).padStart(5, "0");
    refBase = `${prefix}-${communeCode}-${annee}-${seq}`;
    
    // findFirst we can bypass global soft-delete scopes sometimes, 
    // but better yet, findUnique on @unique field checks DB directly.
    const existant = await prisma.property.findUnique({
      where: { propertyCode: refBase },
      select: { id: true }
    });

    if (!existant) {
      isUnique = true;
    } else {
      seqNumber++;
    }
  }

  return refBase;
}

export async function creerBien(data: {
  ownerUserId?:      string;
  typeStructure:     TypeStructure;
  name?:             string;
  unitLabel?:        string;
  parentPropertyId?: string;
  commune:           string;
  address:           string;
  propertyType:      string;
  declaredRentFcfa?: number;
  superficieM2?:          number;

  // Bulk additions
  nbUnits?:          number;
  unitRent?:         number;
}) {
  try {
    const session = await ensureAuthenticated();
    const ownerUserId = data.ownerUserId || session.user.id;
    const { typeStructure, unitLabel, parentPropertyId, nbUnits, unitRent } = data;

    // ... validation logic omitted for brevity as it remains mostly the same, 
    // but the actual replacement will include it to maintain file integrity.
    // I will use a transaction for the whole process.

    return await prisma.$transaction(async (tx) => {
      if (typeStructure !== "INDEPENDANT") {
        if (!unitLabel?.trim() && parentPropertyId) {
          throw new Error(`Nom de l'unité obligatoire pour un bien enfant`);
        }
        if (!parentPropertyId && typeStructure !== "COUR_COMMUNE" && typeStructure !== "IMMEUBLE" && typeStructure !== "RESIDENCE") {
          throw new Error(`Structure parente obligatoire pour un bien enfant`);
        }
      }

      if (typeStructure !== "INDEPENDANT" && !parentPropertyId) {
        if (!data.name?.trim()) {
          throw new Error(`Nom obligatoire pour ${typeStructure}`);
        }
      }

      if (typeStructure !== "INDEPENDANT" && unitLabel && parentPropertyId) {
        const unitesExistantes = await tx.property.findMany({
          where: { parentPropertyId, unitLabel: { not: null } },
          select: { unitLabel: true }
        });
        const labelNorm = unitLabel.trim().toLowerCase();
        const doublon = unitesExistantes.find(u => u.unitLabel?.trim().toLowerCase() === labelNorm);
        if (doublon) {
          throw new Error(`L'unite "${doublon.unitLabel}" existe deja. Choisissez un nom different.`);
        }
      }

      let parentRef: string | undefined;
      let inheritedData: any = {};

      if (parentPropertyId) {
        const parent = await tx.property.findUnique({
          where: { id: parentPropertyId },
          select: { 
            propertyCode: true, 
            name: true, 
            commune: true, 
            address: true, 
            city: true, 
            leaseType: true,
            managedByUserId: true,
            managementMode: true 
          }
        });
        if (!parent) throw new Error("Structure parente introuvable");
        parentRef = parent.propertyCode;
        
        inheritedData = {
          commune: parent.commune,
          address: parent.address,
          city: parent.city,
          leaseType: parent.leaseType,
          managedByUserId: parent.managedByUserId,
          managementMode: parent.managementMode,
        };

        if (!data.name && unitLabel) {
          const parentName = parent.name || parent.propertyCode;
          inheritedData.name = `${parentName} - ${unitLabel}`;
        }
      }

      const unitLabelNorm = unitLabel ? normaliserLabel(unitLabel) : undefined;
      const finalCommune = inheritedData.commune || data.commune;
      const propertyCode = await genererReference(typeStructure, finalCommune, unitLabelNorm, parentRef);

      // Calcul Valeur Locative si Bulk
      let finalDeclaredRent = data.declaredRentFcfa;
      if (!finalDeclaredRent && nbUnits && unitRent) {
        finalDeclaredRent = nbUnits * unitRent;
      }

      const bien = await tx.property.create({
        data: {
          propertyCode,
          ownerUserId,
          typeStructure,
          name:             data.name || inheritedData.name,
          unitLabel:        unitLabelNorm,
          parentPropertyId: data.parentPropertyId,
          commune:          finalCommune,
          address:          inheritedData.address || data.address,
          city:             inheritedData.city,
          leaseType:        inheritedData.leaseType || "residential",
          managedByUserId:  inheritedData.managedByUserId,
          managementMode:   inheritedData.managementMode || "DIRECT",
          propertyType:     data.propertyType,
          declaredRentFcfa: finalDeclaredRent,
          superficieM2:          data.superficieM2,
          status:           "active"
        }
      });

      // --- BULK UNIT CREATION ---
      if (nbUnits && nbUnits > 0 && typeStructure !== 'INDEPENDANT') {
        const prefix = typeStructure === 'IMMEUBLE' ? 'Apt' : 
                       typeStructure === 'COUR_COMMUNE' ? 'Porte' : 'Lot';
        
        for (let i = 1; i <= nbUnits; i++) {
          const childLabel = `${prefix} ${i}`;
          const childLabelNorm = normaliserLabel(childLabel);
          
          // Reference for child
          const childSuffix = childLabelNorm.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
          const childCode = `${bien.propertyCode}-${childSuffix}`;

          await tx.property.create({
            data: {
              propertyCode:     childCode,
              ownerUserId:      ownerUserId,
              typeStructure:    typeStructure,
              name:             `${bien.name} - ${childLabel}`,
              unitLabel:        childLabelNorm,
              parentPropertyId: bien.id,
              commune:          bien.commune,
              address:          bien.address,
              city:             bien.city,
              leaseType:        bien.leaseType,
              managedByUserId:  bien.managedByUserId,
              managementMode:   bien.managementMode,
              propertyType:     typeStructure === 'IMMEUBLE' ? 'APARTMENT' : 
                               typeStructure === 'COUR_COMMUNE' ? 'ROOM' : 'STUDIO',
              declaredRentFcfa: unitRent,
              status:           "active"
            }
          });
        }
      }

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/properties");
      return { success: true, bien: serializeProperty(bien), propertyCode: propertyCode };
    });

  } catch (error: any) {
    console.error("[créerBien Error]:", error);
    return { error: error.message || "Une erreur est survenue lors de la création du bien." };
  }
}

export async function formaterAdresseBien(bien: {
  unitLabel?:      string | null;
  name?:           string | null;
  address:         string;
  commune:         string;
  propertyCode:    string;
  parentProperty?: { name?: string | null; address: string } | null;
}): Promise<string> {
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
    where: {
      ownerUserId,
      parentPropertyId: null,
      status: { not: "archived" }
    },
    include: {
      units: {
        include: {
          leases: {
            where: { status: { not: "ARCHIVED" } },
            include: { tenant: { select: { firstName: true, lastName: true } } },
            take: 1
          }
        },
        orderBy: { unitLabel: "asc" }
      },
      leases: {
        where: { status: { not: "ARCHIVED" } },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getMyParentStructures() {
  const session = await ensureAuthenticated();
  return prisma.property.findMany({
    where: {
      ownerUserId: session.user.id,
      typeStructure: { in: ["COUR_COMMUNE", "IMMEUBLE", "RESIDENCE"] },
      status: { not: "archived" }
    },
    select: {
      id: true,
      name: true,
      typeStructure: true,
      propertyCode: true,
      commune: true,
      address: true
    },
    orderBy: { createdAt: "desc" }
  });
}
