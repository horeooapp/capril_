"use server";

import { prisma } from "@/lib/prisma";

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
