import { prisma } from "./prisma"

/**
 * Updates the ICL score of a user and logs it to ReliabilityScore table.
 */
export async function updateICLScore(userId: string, points: number, reason: string, relatedEntityId?: string) {
    const db = prisma as any; // Bypass stale generated client until next `prisma generate`
    const latest = await db.reliabilityScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' }
    });

    const currentScore = latest?.score ?? 500;
    const newScore = Math.min(1000, Math.max(300, currentScore + points));

    await db.reliabilityScore.create({
        data: {
            userId,
            score: newScore,
            grade: scoreToGrade(newScore),
            kycPoints: 0,
            punctualityPoints: points > 0 ? points : 0,
            completenessPoints: 0,
            digitalSignaturePoints: 0,
            incidentFreePoints: 0,
            entityPresencePoints: 0,
        }
    });
}

function scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 45) return 'D';
    if (score >= 30) return 'E';
    return 'F';
}

/**
 * Handles scoring logic for rent payments based on the Premium Addendum.
 */
export async function scoreRentPayment(tenantId: string, diffDays: number, receiptId?: string) {
    if (diffDays <= 0) {
        // Anticipated payment
        await updateICLScore(tenantId, 5, "Paiement anticipé", receiptId)
    } else if (diffDays === 0) {
        // Exactly on time (handled by <= 0 logic or dedicated)
        await updateICLScore(tenantId, 2, "Paiement à temps", receiptId)
    } else if (diffDays <= 7) {
        // Late < 7 days
        await updateICLScore(tenantId, -5, "Retard inférieur à 7 jours", receiptId)
    } else if (diffDays > 30) {
        // Late > 30 days
        await updateICLScore(tenantId, -30, "Retard critique supérieur à 30 jours", receiptId)
    } else {
        // Regular late
        await updateICLScore(tenantId, -15, "Retard de paiement", receiptId)
    }
}

/**
 * Penalty for confirmed unpaid rent.
 */
export async function scoreUnpaidRent(tenantId: string, leaseId: string) {
    await updateICLScore(tenantId, -100, "Impayé confirmé", leaseId)
}

/**
 * Reward for clean security deposit restitution.
 */
export async function scoreSecurityDepositRestitution(userId: string, isFair: boolean, leaseId: string) {
    if (isFair) {
        await updateICLScore(userId, 20, "Restitution correcte de caution", leaseId)
    } else {
        await updateICLScore(userId, -50, "Litige sur restitution de caution", leaseId)
    }
}
