"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializeUser } from "@/lib/serialize"

export async function getCurrentUser() {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return null

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    
    return serializeUser(user)
}

export async function getUserTrustData() {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) throw new Error("Unauthorized")

    const reliabilityScores = await prisma.reliabilityScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
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
    const viewerId = session?.user?.id
    if (!viewerId) throw new Error("Unauthorized")

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
