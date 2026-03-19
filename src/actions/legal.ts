"use server"

import { prisma } from "@/lib/prisma"
import { LegalType } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Module M-EXPULSION
 * Gestion légale des contentieux et préavis.
 */

export async function createLegalProcedure(leaseId: string, type: LegalType, description?: string) {
    try {
        const procedure = await prisma.legalProcedure.create({
            data: {
                leaseId,
                type,
                status: "OPEN",
                description
            }
        })

        revalidatePath(`/dashboard/leases/${leaseId}`)
        return { success: true, procedureId: procedure.id }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'ouverture de la procédure légale." }
    }
}

export async function serveProcedure(procedureId: string) {
    try {
        await prisma.legalProcedure.update({
            where: { id: procedureId },
            data: {
                status: "SERVED",
                servedAt: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Échec de mise à jour de la signification." }
    }
}
