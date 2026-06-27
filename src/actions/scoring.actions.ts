"use server";

import { prisma } from "@/lib/prisma";

/**
 * Calculates a basic score for a tenant and saves it in history.
 */
export async function calculateTenantScore(tenantId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            const tenant = await tx.user.findUnique({
                where: { id: tenantId },
                include: { leasesAsTenant: true }
            });

            if (!tenant) throw new Error("Locataire introuvable");

            let score = 500; // Base score out of 1000
            
            // 1. Income Factor
            if (tenant.salary && tenant.salary > 0) {
                // If they earn > 300k FCFA, +100
                if (tenant.salary >= 300000) score += 100;
                // If they earn > 500k FCFA, +150
                if (tenant.salary >= 500000) score += 50;
            } else {
                score -= 100;
            }

            // 2. Lease History Factor (Mock logic)
            // In a real scenario, we'd check `Receipt` or `LeaseArrear` or `Dispute`
            let nbLoyersPayes = 0;
            let nbRetards = 0;
            let nbImpayes = 0;
            let nbMediation = 0;
            let nbContestations = 0;

            const leases = tenant.leasesAsTenant;
            if (leases.length > 0) {
                score += 50; // Bonus for having a lease history
                // Just as an example, we count active leases
                nbLoyersPayes = leases.filter(l => l.status === 'ACTIVE').length * 12; 
            } else {
                score -= 50; // Penalty for no history
            }

            // Ensure score bounds
            score = Math.max(0, Math.min(1000, score));

            // Determine tranche
            let tranche = "D";
            if (score >= 800) tranche = "AAA";
            else if (score >= 700) tranche = "AA";
            else if (score >= 600) tranche = "A";
            else if (score >= 500) tranche = "B";
            else if (score >= 400) tranche = "C";

            // Save History
            const history = await tx.tenantScoringHistory.create({
                data: {
                    tenantId,
                    nbLoyersPayes,
                    nbRetards,
                    nbImpayes,
                    nbMediation,
                    nbContestations,
                    scoreFinal: score,
                    tranche,
                    computedAt: new Date()
                }
            });

            return { success: true, history };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves the scoring history for a given tenant
 */
export async function getTenantScoringHistory(tenantId: string) {
    try {
        const history = await prisma.tenantScoringHistory.findMany({
            where: { tenantId },
            orderBy: { computedAt: 'desc' }
        });
        return { success: true, history };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateDataContract(agencyId: string, plan: string, baseCost: number, validUntil: Date): Promise<{ success: boolean; contract?: any; error?: string }> {
    return { success: true, contract: { agencyId, plan, baseCost, validUntil } };
}

export async function consumeDataContract(apiKey: string): Promise<{ success: boolean; remaining?: number; error?: string }> {
    return { success: true, remaining: 99 };
}
