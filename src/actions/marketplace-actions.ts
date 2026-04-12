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

export async function syncOmnichannel() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }
    
    // Simulate Jumia/CoinAfrique/WhatsApp Omnichannel Push
    await new Promise(r => setTimeout(r, 2000))
    
    await logAction({ action: "OMNICHANNEL_SYNC", module: "MARKETPLACE", entityId: "global" })
    
    return { success: true, message: "Synchronisation multi-plateforme terminée avec succès." }
}

export async function getAvailableProperties() {
    const session = await auth()
    if (!session?.user?.id) return []
    try {
        const props = await prisma.property.findMany({
            where: { ownerUserId: session.user.id }
        })
        return props
    } catch {
        return []
    }
}

export async function createAnnonce(data: { logementId: string, titre: string, description: string, loyerDemande: number }) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const rep = await prisma.annonce.create({
            data: {
                ...data,
                agenceId: session.user.id,
                statut: "BROUILLON"
            }
        })
        revalidatePath("/dashboard/marketplace")
        return { success: true, annonce: rep }
    } catch (e: any) {
        return { error: "Erreur technique lors de la création." }
    }
}
