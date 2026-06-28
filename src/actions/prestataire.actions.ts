"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const PRESTATAIRE_LEAD_PRICE = 2000; // 2,000 FCFA per lead

export async function getPrestataires() {
    try {
        const prestataires = await prisma.prestataire.findMany({
            orderBy: { noteMoyenne: 'desc' },
            take: 100
        });
        return { success: true, prestataires };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignPrestataireToTicket(ticketId: string, prestataireId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non authentifié");

    try {
        return await prisma.$transaction(async (tx) => {
            // Check if ticket exists
            const ticket = await tx.ticketMaintenance.findUnique({ where: { id: ticketId } });
            if (!ticket) throw new Error("Ticket introuvable");
            if (ticket.prestataireId) throw new Error("Un prestataire est déjà assigné à ce ticket");

            // We deduct the Lead price from the Prestataire's wallet.
            // Note: In real life, Prestataire must be a User or linked to a User.
            // For now, we will simulate the deduction on the current User's wallet (acting as the Prestataire for the demo).
            const walletTransactions = await tx.walletTransaction.findMany({
                where: { userId: session.user.id, status: "COMPLETED" }
            });

            const balance = walletTransactions.reduce((acc: number, t: any) => {
                return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
            }, 0);

            if (balance < PRESTATAIRE_LEAD_PRICE) {
                throw new Error(`Solde insuffisant pour accepter cette mission. Coût du Lead: ${PRESTATAIRE_LEAD_PRICE} FCFA.`);
            }

            // Debit Wallet
            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "DEBIT",
                    amount: PRESTATAIRE_LEAD_PRICE,
                    status: "COMPLETED",
                    motif: `Achat Lead Maintenance - Ticket #${ticket.id.substring(0,6)}`,
                    referenceId: `LEAD_MAINT_${ticket.id}`
                }
            });

            // Assign Ticket
            const updatedTicket = await tx.ticketMaintenance.update({
                where: { id: ticketId },
                data: {
                    prestataireId: prestataireId,
                    statut: "EN_COURS"
                }
            });

            return { success: true, ticket: updatedTicket };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
