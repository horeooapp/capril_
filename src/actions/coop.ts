"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * QAPRIL - Module M-COOP
 * Gestion des groupes de paiement partagés.
 */

export async function createCoopGroup(leaseId: string, name: string, targetAmount: number) {
    try {
        const coop = await prisma.coopGroup.create({
            data: {
                leaseId,
                name,
                totalTarget: targetAmount,
            }
        })

        revalidatePath(`/dashboard/leases/${leaseId}`)
        return { success: true, coopId: coop.id }
    } catch (error) {
        return { success: false, error: "Échec de création du groupe coopératif." }
    }
}

export async function addMemberToCoop(coopId: string, userId: string) {
    try {
        await prisma.coopGroup.update({
            where: { id: coopId },
            data: {
                members: {
                    connect: { id: userId }
                }
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'ajout du membre." }
    }
}
