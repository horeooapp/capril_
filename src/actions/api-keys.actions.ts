"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const API_PREMIUM_PRICE = 50000; // 50,000 FCFA

export async function getAgencyApiKeys() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    try {
        const keys = await prisma.agenceApiAccess.findMany({
            where: { agenceId: session.user.id }
        })
        return { success: true, keys }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function generateApiKeys() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    try {
        return await prisma.$transaction(async (tx) => {
            // Debit Agency Wallet
            const walletTransactions = await tx.walletTransaction.findMany({
                where: { userId: session.user.id, status: "COMPLETED" }
            });

            const balance = walletTransactions.reduce((acc: number, t: any) => {
                return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
            }, 0);

            if (balance < API_PREMIUM_PRICE) {
                throw new Error(`Solde insuffisant dans votre Wallet. L'abonnement Premium coûte ${API_PREMIUM_PRICE} FCFA.`);
            }

            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "DEBIT",
                    amount: API_PREMIUM_PRICE,
                    status: "COMPLETED",
                    motif: `Abonnement Accès API B2B Premium`,
                    referenceId: `API_${session.user.id}`
                }
            });

            // Delete existing if any (simplification for beta)
            await tx.agenceApiAccess.deleteMany({
                where: { agenceId: session.user.id }
            });

            const apiKey = "qapril_" + crypto.randomBytes(16).toString("hex");
            const apiSecret = crypto.randomBytes(32).toString("hex");

            const access = await tx.agenceApiAccess.create({
                data: {
                    agenceId: session.user.id,
                    tier: "PREMIUM",
                    apiKey,
                    apiSecret,
                    requestsPerDay: 1000,
                    montantMensuel: API_PREMIUM_PRICE,
                    actif: true
                }
            });

            return { success: true, access };
        });
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
