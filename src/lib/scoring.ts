import { prisma } from "./prisma"

/**
 * Updates the Indice de Confiance Locatif (ICL) of a user and logs the event.
 * @param userId - ID of the user (Tenant, Owner, or Agent)
 * @param points - Points to add (positive) or subtract (negative)
 * @param reason - Text description of the event
 * @param relatedEntityId - Optional ID of the lease or receipt linked to this event
 */
export async function updateICLScore(userId: string, points: number, reason: string, relatedEntityId?: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reliabilityScore: true }
    })

    if (!user) return

    // Clamp score between 300 and 1000
    const newScore = Math.min(1000, Math.max(300, user.reliabilityScore + points))

    // Transactions ensure data consistency
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { reliabilityScore: newScore }
        }),
        prisma.trustEvent.create({
            data: {
                userId,
                points,
                reason,
                relatedEntityId
            }
        })
    ])
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
