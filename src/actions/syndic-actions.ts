"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getSyndicates() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.syndicate.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function createSyndicate(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    const residenceName = formData.get("residenceName") as string
    const totalLots = parseInt(formData.get("totalLots") as string || "0")
    const treasuryBalance = parseInt(formData.get("treasuryBalance") as string || "0")
    const agState = formData.get("agState") as string

    if (!residenceName || totalLots <= 0) {
        return { error: "Nom ou nombre de lots invalides." }
    }

    try {
        await prisma.syndicate.create({
            data: {
                residenceName,
                totalLots,
                treasuryBalance,
                agState: agState || "Prévue"
            }
        })

        await logAction({
            action: "CREATE_SYNDICATE",
            module: "SYNDIC",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/syndic")
        return { success: true }
    } catch (e) {
        return { error: "Erreur lors de l'enregistrement de la copropriété." }
    }
}
