import { prisma } from "./prisma";

export type ScoringBreakdown = {
    kycLevel: number;       // 15%
    punctuality: number;    // 30%
    completeness: number;   // 20%
    digitalSignature: number; // 10%
    incidentFree: number;   // 15%
    entityPresence: number; // 10%
};

const db = prisma as any; // Bypass stale generated client until next `prisma generate`

/**
 * Part 13.1: Reliability Scoring Algorithm
 */
export async function calculateReliabilityScore(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            leasesAsTenant: {
                include: {
                    receipts: true,
                    procedurePhases: true,
                    incidentLogs: { where: { resolved: false } }
                }
            }
        }
    });

    if (!user) throw new Error("Utilisateur introuvable.");

    // 1. KYC Level (15%)
    const kycScore = Math.min((user.kycLevel / 4) * 100, 100);

    // 2. Punctuality (30%)
    const allReceipts = user.leasesAsTenant.flatMap((l: any) => l.receipts);
    const paidOnTime = allReceipts.filter((r: any) => r.status === 'paid').length;
    const punctualityScore = allReceipts.length > 0 ? (paidOnTime / allReceipts.length) * 100 : 100;

    // 3. Completeness (20%)
    const paidCount = allReceipts.filter((r: any) => r.status === 'paid').length;
    const completenessScore = allReceipts.length > 0 ? (paidCount / allReceipts.length) * 100 : 100;

    // 4. Digital Signature (10%)
    const signedLeases = user.leasesAsTenant.filter((l: any) => l.signedAt !== null).length;
    const signatureScore = user.leasesAsTenant.length > 0 ? (signedLeases / user.leasesAsTenant.length) * 100 : 100;

    // 5. Incident Free (15%) — incidents nested via leases
    const totalIncidents = user.leasesAsTenant.reduce((acc: number, l: any) => acc + l.incidentLogs.length, 0);
    const incidentScore = totalIncidents === 0 ? 100 : Math.max(100 - (totalIncidents * 25), 0);

    // 6. Entity Presence (10%)
    const entityScore = user.role === 'LANDLORD_PRO' || user.role === 'AGENCY' ? 100 : (user.kycLevel >= 4 ? 100 : 0);

    // Weighted Total
    const totalScore = Math.round(
        (kycScore * 0.15) +
        (punctualityScore * 0.30) +
        (completenessScore * 0.20) +
        (signatureScore * 0.10) +
        (incidentScore * 0.15) +
        (entityScore * 0.10)
    );

    let grade = 'F';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else if (totalScore >= 50) grade = 'D';

    const breakdown: ScoringBreakdown = {
        kycLevel: kycScore,
        punctuality: punctualityScore,
        completeness: completenessScore,
        digitalSignature: signatureScore,
        incidentFree: incidentScore,
        entityPresence: entityScore
    };

    return await db.reliabilityScore.create({
        data: {
            userId,
            score: totalScore,
            grade,
            breakdown: breakdown as any
        }
    });
}
