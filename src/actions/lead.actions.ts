"use server";

import { prisma } from "@/lib/prisma";

const DEFAULT_LEAD_PRICE = 10000; // 10,000 XOF par défaut

/**
 * Récupère les leads disponibles à l'achat pour une agence.
 */
export async function getAvailableLeads(agenceId: string) {
    try {
        // Find leads that have NOT been bought by this agency yet
        const leads = await prisma.lead.findMany({
            where: {
                transactions: {
                    none: {
                        agenceId: agenceId
                    }
                }
            },
            orderBy: {
                scoreQualite: 'desc'
            },
            take: 20
        });

        return { success: true, leads };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Achète un Lead avec le Wallet de l'Agence
 */
export async function purchaseLead(agenceId: string, leadId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            const lead = await tx.lead.findUnique({
                where: { id: leadId }
            });

            if (!lead) throw new Error("Lead introuvable");

            const price = lead.prixLead || DEFAULT_LEAD_PRICE;

            // Vérifier le solde du Wallet
            const walletTransactions = await tx.walletTransaction.findMany({
                where: { userId: agenceId, status: "COMPLETED" }
            });

            const balance = walletTransactions.reduce((acc, t) => {
                return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
            }, 0);

            if (balance < price) {
                throw new Error("Solde insuffisant dans votre Wallet");
            }

            // Débiter le wallet de l'agence
            await tx.walletTransaction.create({
                data: {
                    userId: agenceId,
                    type: "DEBIT",
                    amount: price,
                    status: "COMPLETED",
                    motif: `Achat du Lead qualifié #${leadId}`,
                    referenceId: leadId
                }
            });

            // Créer la transaction Lead
            const leadTx = await tx.leadTransaction.create({
                data: {
                    leadId,
                    agenceId,
                    montant: price,
                    statut: "COMPLETE"
                }
            });

            return { success: true, transaction: leadTx };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Récupère les leads déjà achetés par une agence
 */
export async function getPurchasedLeads(agenceId: string) {
    try {
        const transactions = await prisma.leadTransaction.findMany({
            where: { agenceId },
            include: { lead: true },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, leads: transactions.map(t => t.lead) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
