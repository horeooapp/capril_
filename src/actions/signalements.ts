"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-LOC-SIGNAL : Signalement de problèmes (M5)
 */

export async function createSignalement(userId: string, bailId: string, data: {
    categorie: any,
    description: string,
    urgence?: string,
    photos: string[]
}) {
    const signalement = await (prisma as any).signalementLocataire.create({
        data: {
            locataireId: userId,
            bailId,
            categorie: data.categorie,
            description: data.description,
            urgence: data.urgence || "NORMAL",
            photos: data.photos,
            statut: "ENVOYE"
        }
    })

    // Déclencher notification propriétaire (logique à intégrer via ADD-09)
    // EX: sendNotification(proprioId, "Nouveau signalement...")

    revalidatePath("/locataire/signalements")
    return signalement
}

export async function getSignalementsLocataire(userId: string) {
    return await (prisma as any).signalementLocataire.findMany({
        where: { locataireId: userId },
        include: { bail: { include: { property: true } } },
        orderBy: { createdAt: 'desc' }
    })
}

export async function confirmSignalementResolution(signalId: string, note?: string) {
    const updated = await (prisma as any).signalementLocataire.update({
        where: { id: signalId },
        data: {
            statut: "RESOLU",
            resoluAt: new Date(),
            resoluPar: "LOCATAIRE",
            noteResolution: note
        }
    })
    revalidatePath("/locataire/signalements")
    return updated
}

export async function updateSignalementSeen(signalId: string) {
    return await (prisma as any).signalementLocataire.update({
        where: { id: signalId },
        data: {
            statut: "VU_PROPRIO",
            proprioVuAt: new Date()
        }
    })
}
