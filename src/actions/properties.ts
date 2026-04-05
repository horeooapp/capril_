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

        const properties = await prisma.property.findMany({
            where: {
                OR: [
                    { ownerUserId: userId },
                    { managedByUserId: userId }
                ]
            },
            include: {
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
    areaSqm?: number
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
                areaSqm: data.areaSqm,
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
            surface: (property as any).areaSqm ? Number((property as any).areaSqm) : null,
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

  const count = await prisma.property.count();
  const seq = String(count + 1).padStart(5, "0");

  const refBase = `${prefix}-${communeCode}-${annee}-${seq}`;

  if (type !== "INDEPENDANT" && parentRef && unitLabel) {
    const suffixe = normaliserSuffixe(unitLabel);
    return `${parentRef}-${suffixe}`;
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
  areaSqm?:          number;
}) {
  const session = await ensureAuthenticated();
  const ownerUserId = data.ownerUserId || session.user.id;
  const { typeStructure, unitLabel, parentPropertyId } = data;

  if (typeStructure !== "INDEPENDANT") {
    if (!unitLabel?.trim()) {
      throw new Error(`Nom de l'unite obligatoire pour un bien enfant`);
    }
    if (!parentPropertyId) {
      throw new Error(`Structure parente obligatoire pour un bien enfant`);
    }
  }

  if (typeStructure !== "INDEPENDANT" && !parentPropertyId) {
    if (!data.name?.trim()) {
      throw new Error(`Nom obligatoire pour ${typeStructure}`);
    }
  }

  if (typeStructure !== "INDEPENDANT" && unitLabel && parentPropertyId) {
    const unitesExistantes = await prisma.property.findMany({
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
  if (parentPropertyId) {
    const parent = await prisma.property.findUnique({
      where: { id: parentPropertyId },
      select: { propertyCode: true, name: true }
    });
    if (!parent) throw new Error("Structure parente introuvable");
    parentRef = parent.propertyCode;
  }

  const unitLabelNorm = unitLabel ? normaliserLabel(unitLabel) : undefined;
  const propertyCode = await genererReference(typeStructure, data.commune, unitLabelNorm, parentRef);

  const bien = await prisma.property.create({
    data: {
      propertyCode,
      ownerUserId,
      typeStructure,
      name:             data.name,
      unitLabel:        unitLabelNorm,
      parentPropertyId: data.parentPropertyId,
      commune:          data.commune,
      address:          data.address,
      propertyType:     data.propertyType,
      declaredRentFcfa: data.declaredRentFcfa,
      areaSqm:          data.areaSqm,
      status:           "active"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { success: true, bien, propertyCode: propertyCode };
}

export function formaterAdresseBien(bien: {
  unitLabel?:      string | null;
  name?:           string | null;
  address:         string;
  commune:         string;
  propertyCode:    string;
  parentProperty?: { name?: string | null; address: string } | null;
}): string {
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
            where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
            include: { tenant: { select: { firstName: true, lastName: true } } },
            take: 1
          }
        },
        orderBy: { unitLabel: "asc" }
      },
      leases: {
        where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
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
