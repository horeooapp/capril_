"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

/**
 * ADD-09: Recharger le solde QAPRIL (Wallet) de l'utilisateur.
 * Ce endpoint serait typiquement appelé APRÈS une confirmation Webhook Wave/Orange.
 */
export async function topUpWallet(amount: number, method: string) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non autorisé" }
    }

    try {
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { walletBalance: { increment: amount } }
        })

        await logAction({
            action: "WALLET_TOPUP",
            module: "BILLING",
            entityId: session.user.id,
            newValues: { amount, method, newBalance: user.walletBalance }
        })

        revalidatePath("/dashboard")
        return { success: true, newBalance: user.walletBalance }
    } catch (e) {
        console.error("[WALLET TOPUP] Erreur:", e)
        return { error: "Erreur lors du rechargement statique du portefeuille" }
    }
}
