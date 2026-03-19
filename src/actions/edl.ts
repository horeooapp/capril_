"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * M-EDL : Création d'une nouvelle inspection (Entrée ou Sortie).
 */
export async function createInspection(leaseId: string, type: "ENTRY" | "EXIT", date: Date) {
    try {
        const inspection = await prisma.inspection.create({
            data: {
                leaseId,
                type,
                date,
                status: "PLANIFIEE"
            }
        })
        return { success: true, inspectionId: inspection.id }
    } catch (error) {
        return { success: false, error: "Échec de création de l'inspection." }
    }
}

/**
 * Ajout d'une pièce avec son état.
 */
export async function addInspectionRoom(inspectionId: string, name: string, status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR", comments?: string) {
    try {
        const room = await prisma.inspectionRoom.create({
            data: {
                inspectionId,
                name,
                status,
                comments
            }
        })
        return { success: true, roomId: room.id }
    } catch (error) {
        return { success: false, error: "Échec d'ajout de la pièce." }
    }
}

/**
 * Calcul du score global de l'immobilier (Vétusté).
 */
export async function calculateInspectionScore(inspectionId: string) {
    try {
        const rooms = await prisma.inspectionRoom.findMany({
            where: { inspectionId }
        })

        if (!rooms.length) return { success: false, error: "Aucun état de pièce trouvé." }

        const statusWeights: Record<string, number> = {
            "EXCELLENT": 100,
            "GOOD": 75,
            "FAIR": 50,
            "POOR": 25
        }

        const totalScore = rooms.reduce((acc, room) => acc + statusWeights[room.status], 0)
        const averageScore = Math.round(totalScore / rooms.length)

        await prisma.inspection.update({
            where: { id: inspectionId },
            data: { 
                generalScore: averageScore,
                status: "TERMINEE"
            }
        })

        return { success: true, score: averageScore }
    } catch (error) {
        return { success: false, error: "Erreur lors du calcul du score." }
    }
}
