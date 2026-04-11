"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getCurrentPlan() {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { activePlanTier: true, planExpiresAt: true }
        })
        return user
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function upgradeToPremium() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1) // Abonnement mensuel

        await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                activePlanTier: "PREMIUM",
                planExpiresAt: expiresAt
            }
        })

        await logAction({
            action: "UPGRADE_PLAN_PREMIUM",
            module: "BILLING",
            entityId: session.user.id,
            newValues: { tier: "PREMIUM", expiresAt }
        })

        revalidatePath("/dashboard/billing")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Erreur technique lors du paiement premium." }
    }
}

export async function requestEnterpriseContact() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await logAction({
            action: "REQUEST_ENTERPRISE_PLAN",
            module: "BILLING",
            entityId: session.user.id
        })
        
        return { success: true }
    } catch (e) {
        return { error: "Erreur" }
    }
}
