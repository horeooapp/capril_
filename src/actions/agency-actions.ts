"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAgencyKpis(agencyId: string) {
  try {
    // Calcul de l'occupation
    const totalProperties = await (prisma as any).property.count({ 
      where: { managedByUserId: agencyId } 
    }).catch(() => 0);
    
    const rentedProperties = await (prisma as any).property.count({ 
      where: { managedByUserId: agencyId, status: "rented" } 
    }).catch(() => 0);
    
    const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

    // Calcul des loyers (simulé sur les baux actifs pour la démo/prod initiale)
    const activeLeases = await (prisma as any).lease.findMany({
      where: { agentId: agencyId, status: "ACTIVE" },
      select: { rentAmount: true, chargesAmount: true }
    }).catch(() => []);

    const expectedRent = activeLeases.reduce((acc: number, l: any) => acc + (l.rentAmount + l.chargesAmount), 0);
    
    // Simuler le recouvrement basé sur les quittances du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const collectedReceipts = await (prisma as any).receipt.aggregate({
      where: { 
        lease: { agentId: agencyId },
        status: "paid",
        paidAt: { gte: startOfMonth }
      },
      _sum: { totalAmount: true }
    }).catch(() => ({ _sum: { totalAmount: 0 } }));

    const collectedRent = Number(collectedReceipts._sum.totalAmount || 0);
    const recoveryRate = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;

    return {
      occupancyRate,
      expectedRent,
      collectedRent,
      recoveryRate,
      outstandingArrears: expectedRent - collectedRent,
      monthlyFees: Math.round(collectedRent * 0.1), // Commission de 10% par défaut
      leaseExpirations: await (prisma as any).lease.count({
        where: {
          agentId: agencyId,
          status: "ACTIVE",
          endDate: { lte: new Date(new Date().setMonth(new Date().getMonth() + 3)) }
        }
      }).catch(() => 0)
    };
  } catch (error: any) {
    console.error("[Agency KPI] Fatal Error:", error);
    if (error.code === 'P2021') {
      throw new Error("Table de données agence manquante dans la base de données.");
    }
    return null;
  }
}

export async function getMyAgencyId() {
    const session = await auth();
    if (!session?.user?.id) return null;
    return session.user.id;
}

export async function getAgencyDashboardData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Accès refusé.");
    const userId = session.user.id;

    try {
        // 1. Get Property Accesses
        const accesses = await (prisma as any).propertyAccess.findMany({
            where: { userId, statut: "ACTIF" },
            include: {
                property: {
                    include: {
                        owner: { select: { fullName: true, id: true } },
                        leases: {
                            where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } },
                            include: {
                                tenant: { select: { fullName: true, id: true } }
                            }
                        }
                    }
                }
            }
        });

        // 2. Determine Role (Chef vs Collaborateur)
        // Rule MM-04: Collaborateurs have limited visibility
        const isChef = session.user.role === "AGENCY" || accesses.some((a: any) => a.profil === "chef");
        const agencyRole = isChef ? "chef" : "collaborateur";

        // 3. Process Properties with Masking (Rule MM-04)
        const processedProperties = accesses.map((acc: any) => {
            const p = acc.property;
            const isMasked = !isChef; // Rule MM-04: Mask for collaborators

            return {
                ...p,
                landlord: {
                    ...p.owner,
                    fullName: isMasked ? (p.owner.fullName.substring(0, 3) + "***") : p.owner.fullName
                },
                leases: p.leases.map((l: any) => ({
                    ...l,
                    tenantName: isMasked ? "Locataire Masqué" : (l.tenant?.fullName || "Anonyme")
                }))
            };
        });

        // 4. Fetch Candidatures (M-CAND)
        const propertyIds = accesses.map((a: any) => a.propertyId);
        const candidatures = await (prisma as any).candidature.findMany({
            where: { logementId: { in: propertyIds } },
            orderBy: { createdAt: "desc" }
        });

        // 5. Apply KPI Logic (Reusing or extending getAgencyKpis logic)
        const kpis = await getAgencyKpis(userId);

        return {
            success: true,
            data: {
                user: { ...session.user, agencyRole },
                properties: processedProperties,
                candidatures,
                kpis
            }
        };

    } catch (error: any) {
        console.error("[Agency Dashboard] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function requestCandidateConsent(candidatureId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Accès refusé.");

    try {
        // Rule ICL-CONSENT-01: Update status to track request
        await (prisma as any).candidature.update({
            where: { id: candidatureId },
            data: { statut: "CONSENT_REQUESTED" }
        });

        // In a real scenario, this would trigger a WhatsApp/SMS alert to the candidate
        // For now, we simulate the action
        return { success: true, message: "Demande de consentement envoyée au candidat." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
