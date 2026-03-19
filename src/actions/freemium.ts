"use server"

import { prisma } from "@/lib/prisma"
import { PlanTier } from "@prisma/client"
import { FREEMIUM_CONFIG } from "@/constants/freemium"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Gestion des Abonnements Freemium (M-FREEMIUM)
 */

export async function changeUserPlan(userId: string, newTier: PlanTier, reason?: string, executedBy?: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { activePlanTier: true }
        })

        if (!user) return { success: false, error: "Utilisateur non trouvé." }

        // Mises à jour atomique : User + Audit
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    activePlanTier: newTier,
                    // Par défaut 1 an pour les démos, à ajuster selon le paiement réel
                    planExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
            }),
            prisma.subscriptionAudit.create({
                data: {
                    userId,
                    oldTier: user.activePlanTier,
                    newTier,
                    reason,
                    executedById: executedBy
                }
            })
        ])

        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("FREEMIUM_UPDATE_ERROR:", error)
        return { success: false, error: "Erreur lors du changement de palier." }
    }
}

/**
 * Vérifie si un utilisateur a atteint une limite de son plan
 * @param userId 
 * @param feature Fonctionnalité ou quota à vérifier
 */
export async function checkPlanLimit(userId: string, feature: "maxUnits") {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { propertiesOwned: { select: { id: true } } }
    })

    if (!user) return false

    const config = FREEMIUM_CONFIG[user.activePlanTier as keyof typeof FREEMIUM_CONFIG]
    
    if (feature === "maxUnits") {
        return user.propertiesOwned.length < config.maxUnits
    }

    return true
}
