"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return null

    return await prisma.user.findUnique({
        where: { id: userId }
    })
}

export async function getUserTrustData() {
    const session = await auth()
    // @ts-ignore
    const userId = session?.user?.id
    if (!userId) throw new Error("Unauthorized")

    const db = prisma as any;

    const reliabilityScores = await db.reliabilityScore.findMany({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
        take: 20
    });

    const latestScore = reliabilityScores[0];

    return {
        reliabilityScore: latestScore?.score ?? 750,
        reliabilityScores,
        grade: latestScore?.grade ?? 'C'
    }
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
            module: "USER",
            entityId: targetUserId,
            newValues: { reason, timestamp: new Date() }
        }
    })
    
    return { success: true }
}
