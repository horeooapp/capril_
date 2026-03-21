"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializeUser } from "@/lib/serialize"
import { ensureAuthenticated } from "./auth-helpers"
import { revalidatePath } from "next/cache"

export async function getCurrentUser() {
    try {
        const session = await auth() // Use auth() here to avoid throwing error for non-logged in users if serialized return is expected
        const userId = session?.user?.id
        if (!userId) return null

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        
        return serializeUser(user)
    } catch (error) {
        console.error("[ACTION] getCurrentUser error:", error)
        return null
    }
}

export async function getUserTrustData() {
    const session = await ensureAuthenticated()
    const userId = session.user.id

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
    const session = await ensureAuthenticated()
    const viewerId = session.user.id

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

export async function updateProfile(data: { fullName?: string, email?: string, role?: string }) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...data,
                status: 'ACTIVE' 
            } as any
        })

        revalidatePath("/dashboard")
        revalidatePath("/locataire")

        const { logAction } = await import("./audit")
        await logAction({
            action: "UPDATE_PROFILE",
            module: "USER",
            entityId: session.user.id,
            newValues: data
        })
        
        return { success: true }
    } catch (error) {
        console.error("[SERVER ACTION] Error updating user profile:", error)
        return { error: "Impossible de mettre à jour le profil. Veuillez réessayer." }
    }
}
