import { prisma } from "./prisma"

/**
 * Updates the reliability score of a user based on their actions.
 * @param userId - ID of the user (Tenant, Owner, or Agent)
 * @param points - Points to add (positive) or subtract (negative)
 */
export async function updateReliabilityScore(userId: string, points: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reliabilityScore: true }
    })

    if (!user) return

    const newScore = Math.min(100, Math.max(0, user.reliabilityScore + points))

    await prisma.user.update({
        where: { id: userId },
        data: { reliabilityScore: newScore }
    })
}

/**
 * Handles scoring logic for rent payments.
 * Called when a receipt is created.
 */
export async function scoreRentPayment(tenantId: string, isOnTime: boolean) {
    // Reward systematic on-time payment
    if (isOnTime) {
        await updateReliabilityScore(tenantId, 1.0)
    } else {
        // Penalty for late payment (significant)
        await updateReliabilityScore(tenantId, -5.0)
    }
}

/**
 * Handles scoring logic for agents.
 * Called when a mandate is validated or rejected.
 */
export async function scoreAgentCompliance(agentId: string, isApproved: boolean) {
    if (isApproved) {
        await updateReliabilityScore(agentId, 0.5)
    } else {
        await updateReliabilityScore(agentId, -2.0)
    }
}

/**
 * Handles scoring logic for owners/managers.
 * Typically based on escrow releases or dispute resolution.
 */
export async function scoreOwnerManagement(ownerId: string, isFairRelease: boolean) {
    if (isFairRelease) {
        await updateReliabilityScore(ownerId, 0.5)
    } else {
        await updateReliabilityScore(ownerId, -3.0)
    }
}
