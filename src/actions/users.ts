"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getUserTrustData() {
    const session = await auth()
    // @ts-ignore
    const userId = session?.user?.id
    if (!userId) throw new Error("Unauthorized")

    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            reliabilityScore: true,
            trustEvents: {
                orderBy: { createdAt: 'desc' },
                take: 20
            }
        }
    })
}
export async function logScoreConsultation(targetUserId: string, reason: string) {
    const session = await auth()
    // @ts-ignore
    const viewerId = session?.user?.id
    if (!viewerId) throw new Error("Unauthorized")

    // In a real app, logic would verify authorization (e.g., active lease app)
    
    await prisma.auditLog.create({
        data: {
            userId: viewerId,
            action: "CONSULTATION_SCORE",
            entityType: "USER",
            entityId: targetUserId,
            details: JSON.stringify({ reason, timestamp: new Date() })
        }
    })
    
    return { success: true }
}
