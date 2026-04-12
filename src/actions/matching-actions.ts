"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getPendingCandidatures() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const candidatures = await prisma.candidature.findMany({
            where: {
                statut: "SOUMISE",
                logement: {
                    managedByUserId: session.user.id
                }
            },
            include: {
                logement: true,
                candidat: {
                    include: {
                        locataireProfile: true
                    }
                }
            },
            orderBy: { scoreQapril: 'desc' }
        })
        return candidatures
    } catch {
        return []
    }
}

export async function processCandidature(candidatureId: string, action: "ACCEPTE" | "REJETE") {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.candidature.update({
            where: { id: candidatureId },
            data: { statut: action }
        })

        await logAction({
            action: `CANDIDATURE_${action}`,
            module: "MATCHING",
            entityId: candidatureId
        })

        revalidatePath("/dashboard/matching")
        return { success: true }
    } catch (e) {
        return { error: "Erreur lors du traitement de la candidature." }
    }
}
