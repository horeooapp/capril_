"use server";

import { prisma } from "@/lib/prisma";
import { InsuranceStatus } from "@prisma/client";

/**
 * List available insurance products
 */
export async function listInsuranceProducts() {
    try {
        const products = await prisma.insuranceProduct.findMany({
            where: { actif: true }
        });
        return { success: true, products };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe a landlord/lease to an insurance product
 */
export async function subscribeToInsurance(
    landlordId: string,
    leaseId: string,
    productId: string
) {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Verify product
            const product = await tx.insuranceProduct.findUnique({
                where: { id: productId }
            });
            if (!product || !product.actif) {
                throw new Error("Produit d'assurance introuvable ou inactif");
            }

            // 2. Verify lease
            const lease = await tx.lease.findUnique({
                where: { id: leaseId }
            });
            if (!lease) {
                throw new Error("Bail introuvable");
            }
            if (lease.landlordId !== landlordId) {
                throw new Error("Vous n'êtes pas autorisé à souscrire une assurance pour ce bail");
            }

            // 3. Calculate premiums
            const loyerAnnuel = lease.rentAmount * 12;
            const montantPrime = loyerAnnuel * (product.tauxPrime / 100);
            const commission = montantPrime * (product.tauxCommission / 100);

            // Fetch tenant score to snapshot it
            const scoring = await tx.tenantScoringHistory.findFirst({
                where: { tenantId: lease.tenantId },
                orderBy: { computedAt: 'desc' }
            });

            const snapshot = scoring ? {
                scoreFinal: scoring.scoreFinal,
                tranche: scoring.tranche,
                computedAt: scoring.computedAt
            } : { status: "NO_SCORE_AVAILABLE" };

            // 4. Create subscription
            const dateDebut = new Date();
            const dateFin = new Date();
            dateFin.setFullYear(dateDebut.getFullYear() + 1);

            const souscription = await tx.insuranceSouscription.create({
                data: {
                    productId,
                    leaseId,
                    landlordId,
                    scoringSnapshot: snapshot,
                    montantPrimeAnnuelle: montantPrime,
                    commissionPlateforme: commission,
                    dateDebut,
                    dateFin,
                    statut: "ACTIVE", // Active immediately for simplicity, could be PENDING in real world
                }
            });

            return { success: true, souscription };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Update the status of a subscription (e.g., CANCELLED)
 */
export async function updateSubscriptionStatus(subscriptionId: string, status: InsuranceStatus) {
    try {
        const souscription = await prisma.insuranceSouscription.update({
            where: { id: subscriptionId },
            data: { statut: status }
        });
        return { success: true, souscription };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
