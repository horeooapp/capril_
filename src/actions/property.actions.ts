"use server";
// QAPRIL - property.actions.ts - Gestion des biens avec hierarchie
// Inclut : unitLabel (optionnel INDEPENDANT, obligatoire sinon)
//          typeStructure : INDEPENDANT|COUR_COMMUNE|IMMEUBLE|RESIDENCE
//          parentPropertyId : obligatoire si pas INDEPENDANT

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type TypeStructure =
  "INDEPENDANT" | "COUR_COMMUNE" | "IMMEUBLE" | "RESIDENCE";

// Creer un bien (independant ou enfant)
export async function creerBien(data: {
  ownerUserId:      string;
  typeStructure:    TypeStructure;
  unitLabel?:       string;   // optionnel si INDEPENDANT
  parentPropertyId?: string;  // obligatoire si pas INDEPENDANT
  commune:          string;
  address:          string;
  propertyType:     string;
  declaredRentFcfa?: number;
  areaSqm?:         number;
  name?:            string;
}) {
  // Validation hierarchie
  if (data.typeStructure !== "INDEPENDANT") {
    if (!data.unitLabel?.trim()) {
      throw new Error(`unitLabel obligatoire pour ${data.typeStructure}`);
    }
    if (!data.parentPropertyId) {
      throw new Error(`parentPropertyId obligatoire pour ${data.typeStructure}`);
    }
    // Verifier que le parent existe et est du bon type
    const parent = await prisma.property.findUnique({
      where: { id: data.parentPropertyId }
    });
    if (!parent) throw new Error("Structure parente introuvable");
  }

  // Reference auto - format HAB-ABJ-COM-NNNNN[-UNIT]
  const count = await prisma.property.count({
    where: { ownerUserId: data.ownerUserId }
  });
  const communeCode = data.commune.slice(0,3).toUpperCase();
  const num = String(count + 1).padStart(5, "0");
  const unitSuffix = data.unitLabel
    ? "-" + data.unitLabel.replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,4)
    : "";
  const propertyCode = `HAB-ABJ-${communeCode}-${num}${unitSuffix}`;

  const bien = await prisma.property.create({
    data: {
      propertyCode,
      ownerUserId:      data.ownerUserId,
      propertyType:     data.propertyType,
      commune:          data.commune,
      address:          data.address,
      name:             data.name,
      unitLabel:        data.unitLabel,
      typeStructure:    data.typeStructure,
      parentPropertyId: data.parentPropertyId,
      declaredRentFcfa: data.declaredRentFcfa,
      areaSqm:          data.areaSqm,
      status:           "draft",
    }
  });

  revalidatePath("/dashboard");
  return { success: true, bien };
}

// Adresse complete pour quittances et baux - RG-BAIL-ADRESSE
export function formaterAdresseBien(bien: {
  unitLabel?: string | null;
  address: string;
  commune: string;
  parentProperty?: { name?: string | null; address: string } | null;
}): string {
  const parts: string[] = [];
  if (bien.parentProperty?.name) parts.push(bien.parentProperty.name);
  if (bien.unitLabel) parts.push(bien.unitLabel);
  parts.push(bien.address);
  parts.push(bien.commune);
  return parts.join(" · ");
}
// Exemples :
// "Imm. Les Palmiers · Apt 2B · Cocody Riviera 3 · Cocody"
// "Cour Kone · Porte 3 · Rue 12 · Abobo"
// "Studio du bas · Rue des Jardins · Marcory" (independant nomme)
// "Rue des Jardins · Marcory" (independant sans nom)

// Biens d'un bailleur avec leurs enfants
export async function getBiensPortefeuille(ownerUserId: string) {
  return prisma.property.findMany({
    where: {
      ownerUserId,
      parentPropertyId: null, // uniquement les parents et independants
      status: { not: "archived" }
    },
    include: {
      units: {
        include: {
          leases: {
            where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
            include: { tenant: { select: { fullName: true } } },
            take: 1
          }
        }
      },
      leases: {
        where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
        include: { tenant: { select: { fullName: true } } },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

// Verifier si un bail peut etre cree sur ce bien
export async function peutCreerBail(propertyId: string): Promise<{
  ok: boolean; raison?: string
}> {
  const bien = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { units: { include: { leases: {
      where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } }
    }}}}
  });
  if (!bien) return { ok: false, raison: "Bien introuvable" };

  // Un parent avec des enfants ayant des baux actifs ne peut pas
  // recevoir un bail direct (sauf COUR_ENTIERE)
  const enfantsActifs = bien.units.filter(
    u => u.leases.length > 0
  ).length;
  if (enfantsActifs > 0) {
    return { ok: false, raison:
      `${enfantsActifs} unite(s) ont des baux actifs. ` +
      `Bail direct impossible sauf type COUR_ENTIERE.`
    };
  }
  return { ok: true };
}

// Retrait de bien (soft delete & notifications)
export async function retirerProperty(propertyId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Non autorisé.")

    try {
        const result = await prisma.$transaction(async (tx) => {
            const property = await tx.property.findUnique({
                where: { id: propertyId },
                include: {
                    leases: {
                        where: { status: 'ACTIVE' },
                        select: { tenantId: true, tenant: { select: { phone: true, fullName: true } } }
                    },
                    mandates: {
                        where: { status: 'ACTIVE' },
                        select: { agentUserId: true, agent: { select: { phone: true, name: true } } }
                    }
                }
            })

            if (!property) throw new Error("Bien non trouvé.")
            if (property.ownerUserId !== session.user.id) throw new Error("Propriétaire non autorisé.")

            await tx.property.update({
                where: { id: propertyId },
                data: { status: 'archived' }
            })

            let locsNotified = 0
            for (const lease of property.leases) {
                if (lease.tenantId && (lease.tenant as any).phone) {
                    await tx.notification.create({
                        data: {
                            userId: lease.tenantId,
                            channel: 'SMS',
                            title: 'Retrait de bien',
                            content: `QAPRIL : Le bien ${property.name || property.propertyCode} a été retiré du portefeuille par son bailleur.`
                        }
                    })
                    locsNotified++
                }
            }

            let agenceNotified = false
            for (const mandat of property.mandates) {
                if (mandat.agentUserId && (mandat.agent as any).phone) {
                    await tx.notification.create({
                        data: {
                            userId: mandat.agentUserId,
                            channel: 'SMS',
                            title: 'Mandat suspendu',
                            content: `QAPRIL : Le propriétaire a retiré le bien ${property.propertyCode}. Votre mandat est résilié immédiatement.`
                        }
                    })
                    agenceNotified = true
                }
            }

            return { archived: true, locatairesNotifies: locsNotified, agenceNotifiee: agenceNotified }
        })

        revalidatePath("/dashboard")
        return { success: true, ...result }

    } catch (error) {
        console.error("Erreur retrait bien:", error)
        return { error: "Erreur lors du retrait du bien." }
    }
}
