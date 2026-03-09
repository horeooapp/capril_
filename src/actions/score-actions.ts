"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculateReliabilityScore } from "@/lib/reliability"
import { Role } from "@prisma/client"

/**
 * Part 13.2: Refresh User Reliability Score
 */
export async function refreshReliabilityScore(targetUserId?: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    const userId = targetUserId || session.user.id;
    
    // Authorization check: Self or Admin
    if (userId !== session.user.id && (session.user.role as Role) !== Role.ADMIN) {
        throw new Error("Accès non autorisé.");
    }

    try {
        const scoreEntry = await calculateReliabilityScore(userId);
        revalidatePath("/dashboard/profile");
        return { success: true, score: scoreEntry.score, grade: scoreEntry.grade };
    } catch (error: any) {
        console.error("Erreur refresh score:", error);
        return { error: "Impossible de mettre à jour le score." };
    }
}

/**
 * Part 13.3: Get Latest Score
 */
export async function getLatestScore(userId: string) {
    return await prisma.reliabilityScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}
