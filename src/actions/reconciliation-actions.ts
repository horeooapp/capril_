"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import { PaymentCanal } from "@prisma/client"

export async function getReconciliations() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const recons = await prisma.pgwReconciliation.findMany({
            orderBy: { dateRecon: 'desc' },
            take: 10
        })
        return recons
    } catch (e) {
        console.error("Erreur lors du chargement des réconciliations:", e)
        return []
    }
}

export async function triggerReconciliation(canal: PaymentCanal) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        // Mocking a long PGW API call...
        await new Promise(r => setTimeout(r, 2000))
        
        // Let's create a mockup record for the audit
        const nbQapril = Math.floor(Math.random() * 50) + 10
        const nbEcarts = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
        const montant = nbQapril * 150000

        const recon = await prisma.pgwReconciliation.create({
            data: {
                dateRecon: new Date(),
                canal,
                nbTransactionsQapril: nbQapril,
                nbTransactionsOperateur: nbQapril - nbEcarts,
                montantTotalQapril: montant,
                montantTotalOperateur: montant - (nbEcarts * 150000),
                nbEcarts,
                statut: nbEcarts > 0 ? "ECARTS_CONSTATES" : "CLOTURE",
                ...(nbEcarts > 0 ? { ecartsDetail: [{ msg: "Transaction orpheline détectée", amount: 150000 }] } : {})
            }
        })

        await logAction({
            action: "TRIGGER_PGW_RECON",
            module: "FINANCE",
            entityId: recon.id,
            newValues: { canal }
        })

        revalidatePath("/dashboard/wallet/reconciliation")
        return { success: true, data: recon }
    } catch (e) {
        console.error(e)
        return { error: "Impossible de lancer la réconciliation." }
    }
}
