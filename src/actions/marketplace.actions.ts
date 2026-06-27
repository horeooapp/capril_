"use server";

import { prisma } from "@/lib/prisma";

/**
 * Lists all available leads on the marketplace
 */
export async function listAvailableLeads(filters?: { commune?: string; typeBien?: string }) {
    try {
        const whereClause: any = {
            statut: "NOUVEAU",
            acheteurId: null
        };

        if (filters?.commune) whereClause.communeCible = filters.commune;
        if (filters?.typeBien) whereClause.typeBienRecherche = filters.typeBien;

        const leads = await prisma.lead.findMany({
            where: whereClause,
            orderBy: { scoreQualite: 'desc' },
            take: 50 // Limit to 50 for performance
        });

        return { success: true, leads };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Purchases a lead for an agency
 * Note: Payment deduction logic (wallet or direct) goes here.
 */
export async function purchaseLead(agenceId: string, leadId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Find the lead
            const lead = await tx.lead.findUnique({ where: { id: leadId } });
            if (!lead) throw new Error("Lead introuvable");
            if (lead.statut !== "NOUVEAU" || lead.acheteurId) {
                throw new Error("Ce Lead a déjà été acheté ou n'est plus disponible");
            }

            // 2. Ensure agency exists
            const agence = await tx.user.findUnique({ where: { id: agenceId } });
            if (!agence) throw new Error("Agence introuvable");

            // TODO: Here we would deduct `lead.prixLead` from `agence.Wallet` 
            // OR initiate a payment via Stripe/Mobile Money.
            const montantPaye = lead.prixLead || 5000; // default to 5000 FCFA

            // 3. Mark Lead as sold
            const updatedLead = await tx.lead.update({
                where: { id: leadId },
                data: {
                    statut: "VENDU",
                    acheteurId: agenceId,
                    acheteurAt: new Date()
                }
            });

            // 4. Create Transaction Record
            const transaction = await tx.leadTransaction.create({
                data: {
                    leadId,
                    agenceId,
                    montant: montantPaye,
                    statut: "COMPLETE" // Assumes direct Wallet deduction for now
                }
            });

            return { success: true, lead: updatedLead, transaction };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Calculates a lead's "heat" score and sets its dynamic price
 */
export async function scoreLead(leadId: string) {
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) throw new Error("Lead introuvable");

        let score = 0;
        let basePrice = 2000; // Base 2000 FCFA

        // Has budget defined?
        if (lead.budgetDeclare && lead.budgetDeclare > 0) {
            score += 30;
            if (lead.budgetDeclare > 300000) basePrice += 1000;
            if (lead.budgetDeclare > 800000) basePrice += 3000;
        }

        // Has targeted commune?
        if (lead.communeCible) {
            score += 20;
            // Premium zones logic
            const premiumZones = ["COCODY", "MARCORY", "ZONE 4", "BINGERVILLE"];
            if (premiumZones.includes(lead.communeCible.toUpperCase())) {
                score += 20;
                basePrice += 2000;
            }
        }

        // Has property type?
        if (lead.typeBienRecherche) {
            score += 10;
        }

        // Has phone validated? (Assumed true if they are a lead)
        if (lead.telephone) {
            score += 20;
        }

        const updated = await prisma.lead.update({
            where: { id: leadId },
            data: {
                scoreQualite: score,
                prixLead: basePrice
            }
        });

        return { success: true, lead: updated };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
