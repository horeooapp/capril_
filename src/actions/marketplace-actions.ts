"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getMarketplaceAnnonces() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.annonce.findMany({
            where: { agenceId: session.user.id },
            include: { logement: true },
            orderBy: { publieeAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function publishAnnonce(annonceId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.annonce.update({
            where: { id: annonceId },
            data: { 
                statut: "ACTIVE",
                publieeAt: new Date()
            }
        })

        await logAction({
            action: "PUBLISH_ANNONCE",
            module: "MARKETPLACE",
            entityId: annonceId
        })

        revalidatePath("/dashboard/marketplace")
        return { success: true }
    } catch (e) {
        return { error: "Erreur technique lors de la publication." }
    }
}
