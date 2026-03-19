"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Module M-DIASPORA
 * Gestion des bailleurs et mandats internationaux.
 */

export async function createProcuration(data: {
    mandantId: string
    mandataireId: string
    droits: any
    dateDebut: Date
    dateFin?: Date
}) {
    try {
        const procuration = await prisma.procurationNumerique.create({
            data: {
                mandantId: data.mandantId,
                mandataireId: data.mandataireId,
                droits: data.droits,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                actif: true
            }
        })

        revalidatePath("/dashboard/diaspora")
        return { success: true, id: procuration.id }
    } catch (error) {
        console.error("DIASPORA_PROC_ERROR:", error)
        return { success: false, error: "Échec de création de la procuration." }
    }
}

export async function updateUserResidence(userId: string, data: {
    paysResidence: string
    fuseauHoraire: string
    emailRapportMensuel?: string
}) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                paysResidence: data.paysResidence,
                fuseauHoraire: data.fuseauHoraire,
                emailRapportMensuel: data.emailRapportMensuel
            }
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour des infos internationales." }
    }
}
