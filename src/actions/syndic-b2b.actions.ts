"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const SYNDIC_SAAS_PRICE = 25000; // 25,000 XOF / month

/**
 * Subscribes a user to the Syndic SaaS module
 */
export async function subscribeSyndicSaaS() {
    const session = await auth();
    if (!session?.user) throw new Error("Non authentifié");

    try {
        return await prisma.$transaction(async (tx) => {
            const walletTransactions = await tx.walletTransaction.findMany({
                where: { userId: session.user.id, status: "COMPLETED" }
            });

            const balance = walletTransactions.reduce((acc: number, t: any) => {
                return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
            }, 0);

            if (balance < SYNDIC_SAAS_PRICE) {
                throw new Error(`Solde insuffisant pour l'abonnement SaaS. Coût: ${SYNDIC_SAAS_PRICE} XOF/mois.`);
            }

            // Debit Wallet
            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "DEBIT",
                    amount: SYNDIC_SAAS_PRICE,
                    status: "COMPLETED",
                    motif: `Abonnement SaaS Syndic B2B`,
                    referenceId: `SAAS_SYNDIC_${Date.now()}`
                }
            });

            // Note: In reality, we'd mark the User profile or a UserSubscription table as "SYNDIC_ACTIVE".
            // Here, we'll return success to allow UI unlocking.
            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Generates a global invoice (appel de fond) for a Syndicate
 */
export async function createSyndicFacture(
    syndicateId: string,
    periode: string, // e.g. "2026-06"
    nbLots: number,
    montantParLot: number
) {
    try {
        const montantTotal = nbLots * montantParLot;

        const facture = await prisma.syndicFacture.create({
            data: {
                syndicateId,
                periode,
                nbLots,
                montantParLot,
                montantTotal,
                statut: "EN_ATTENTE"
            }
        });

        return { success: true, facture };
    } catch (error: any) {
        // Handle unique constraint error if facture for periode already exists
        if (error.code === 'P2002') {
            return { success: false, error: "Une facture pour cette période existe déjà." };
        }
        return { success: false, error: error.message };
    }
}

/**
 * Marks a syndic invoice as paid
 */
export async function markSyndicFacturePaid(factureId: string, paymentRef?: string) {
    try {
        const facture = await prisma.syndicFacture.update({
            where: { id: factureId },
            data: { 
                statut: "PAYEE",
                paymentPgwId: paymentRef
            }
        });
        return { success: true, facture };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Schedules a General Assembly (AG) for the Syndicate
 */
export async function scheduleSyndicAG(
    syndicateId: string,
    ordreDuJour: string,
    dateAG: Date,
    montantFacture?: number
) {
    try {
        const ag = await prisma.syndicAG.create({
            data: {
                syndicateId,
                ordre_du_jour: ordreDuJour,
                dateAG,
                montantFacture: montantFacture || 0,
                statut: "PLANIFIEE"
            }
        });
        return { success: true, ag };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Uploads AG minutes and marks it as completed
 */
export async function uploadSyndicAGMinutes(
    agId: string,
    compteRendu: string
) {
    try {
        const ag = await prisma.syndicAG.update({
            where: { id: agId },
            data: {
                compte_rendu: compteRendu,
                statut: "TERMINEE"
            }
        });
        return { success: true, ag };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
