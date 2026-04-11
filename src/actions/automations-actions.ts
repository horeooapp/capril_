"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getAutomationSettings() {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        const settings = await prisma.automationSettings.upsert({
            where: { userId: session.user.id },
            update: {},
            create: {
                userId: session.user.id,
                autoRelance: true,
                autoQuittance: true,
                autoAssurance: false
            }
        })
        return settings
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function toggleAutomation(key: 'autoRelance' | 'autoQuittance' | 'autoAssurance', status: boolean) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.automationSettings.upsert({
            where: { userId: session.user.id },
            update: { [key]: status },
            create: {
                userId: session.user.id,
                autoRelance: key === 'autoRelance' ? status : true,
                autoQuittance: key === 'autoQuittance' ? status : true,
                autoAssurance: key === 'autoAssurance' ? status : false
            }
        })

        await logAction({
            action: status ? `ENABLE_AUTOMATION_${key}` : `DISABLE_AUTOMATION_${key}`,
            module: "ROBOTS",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/automations")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Erreur serveur lors de la mise à jour des robots." }
    }
}
