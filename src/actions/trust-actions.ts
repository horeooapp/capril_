"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getVaultCautions() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.vaultCaution.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function transferToVault(cautionId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        
        await prisma.vaultCaution.update({
            where: { id: cautionId },
            data: { 
                status: "CONSIGNEE",
                hash: Math.random().toString(36).substring(2, 10).toUpperCase() + "-CDC",
                dateConsignation: today
            }
        })

        await logAction({
            action: "TRANSFER_CAUTION",
            module: "TRUST_VAULT",
            entityId: cautionId
        })

        revalidatePath("/dashboard/trust")
        return { success: true }
    } catch (e) {
        return { error: "Erreur technique lors du transfert vers la Caisse des Dépôts." }
    }
}
