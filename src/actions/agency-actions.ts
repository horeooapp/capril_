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
        status: { in: ["paid", "PAID", "Paid"] },
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
    // Removed throw on P2021 to prevent hanging Promise.all loading
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
            where: { userId, revokedAt: null, statut: "ACTIF" },
            include: {
                property: {
                    include: {
                        owner: { select: { firstName: true, lastName: true, id: true } },
                        leases: {
                            where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } },
                            include: {
                                tenant: { select: { firstName: true, lastName: true, id: true } }
                            }
                        }
                    }
                }
            }
        });

        // Get properties directly managed by the agency (if they created them directly)
        const directProperties = await (prisma as any).property.findMany({
            where: { OR: [{ ownerUserId: userId }, { managedByUserId: userId }] },
            include: {
                owner: { select: { firstName: true, lastName: true, id: true } },
                leases: {
                    where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } },
                    include: {
                        tenant: { select: { firstName: true, lastName: true, id: true } }
                    }
                }
            }
        });

        // Merge properties avoiding duplicates
        const allPropertiesMap = new Map();
        directProperties.forEach((p: any) => allPropertiesMap.set(p.id, p));
        accesses.forEach((a: any) => { if (a.property) allPropertiesMap.set(a.propertyId, a.property); });
        
        const mergedProperties = Array.from(allPropertiesMap.values());

        // 2. Determine Role (Chef vs Collaborateur)
        const isChef = ['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE', 'AGENCE_NON_AGREE'].includes(session.user.role) || (session.user as any).capaciteActive?.includes('AGENCY');
        const agencyRole = isChef ? "chef" : "collaborateur";

        // 3. Process Properties with Masking (Rule MM-04)
        const processedProperties = mergedProperties.map((p: any) => {
            const isMasked = !isChef; // Rule MM-04: Mask for collaborators

            return {
                ...p,
                landlord: {
                    ...p.owner,
                    fullName: isMasked ? ((p.owner?.firstName ? p.owner.firstName + " " : "") + (p.owner?.lastName || "").substring(0, 3) + "***") : ((p.owner?.firstName ? p.owner.firstName + " " : "") + (p.owner?.lastName || ""))
                },
                leases: p.leases?.map((l: any) => ({
                    ...l,
                    tenantName: isMasked ? "Locataire Masqué" : ((l.tenant?.firstName ? l.tenant.firstName + " " : "") + (l.tenant?.lastName || "") || "Anonyme")
                })) || []
            };
        });

        // 4. Fetch Candidatures (M-CAND)
        const propertyIds = mergedProperties.map((p: any) => p.id);
        const candidatures = propertyIds.length > 0 ? await (prisma as any).candidature.findMany({
            where: { logementId: { in: propertyIds } },
            orderBy: { createdAt: "desc" }
        }) : [];

        // 5. Apply KPI Logic
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
        console.log(`[SMS-MOCK] => Notifying candidate of candidature ${candidatureId} to provide consent (Rule ICL-CONSENT-01)`);
        return { success: true, message: "Demande de consentement envoyée au candidat." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
