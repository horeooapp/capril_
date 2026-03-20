"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateReceiptRef, generateQRToken, calculateReceiptHash } from "@/lib/financial-utils"
import { Role } from "@prisma/client"
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers"

export type CreateReceiptInput = {
    leaseId: string;
    periodMonth: string; // YYYY-MM
    rentAmount: number;
    chargesAmount?: number;
    paymentMethod: 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER';
    paymentRef?: string;
    isDeposit?: boolean; // If true, triggers CDC-CI consignation logic
};

/**
 * Part 9.1: Create Receipt
 */
export async function createReceipt(input: CreateReceiptInput) {
    const session = await ensureAuthenticated();
    
    // Only Landlords or Agencies can create receipts
    await ensureLeaseAccess(input.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY]);

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: input.leaseId },
            select: { leaseType: true, id: true }
        });

        if (!lease) throw new Error("Bail introuvable.");

        const receiptRef = await generateReceiptRef(lease.leaseType);
        const totalAmount = input.rentAmount + (input.chargesAmount || 0);

        const receipt = await prisma.receipt.create({
            data: {
                receiptRef,
                leaseId: lease.id,
                periodMonth: input.periodMonth,
                rentAmount: input.rentAmount,
                chargesAmount: input.chargesAmount || 0,
                totalAmount,
                paymentMethod: input.paymentMethod,
                paymentRef: input.paymentRef,
                status: 'PENDING'
            }
        });

        // Trigger CDC logic if it's a security deposit
        if (input.isDeposit) {
            await prisma.cDCDeposit.upsert({
                where: { leaseId: lease.id },
                update: { amount: totalAmount, status: "AWAITING_PAYMENT" },
                create: {
                    leaseId: lease.id,
                    amount: totalAmount,
                    status: "AWAITING_PAYMENT"
                }
            });
        }

        revalidatePath("/dashboard/receipts");
        return { success: true, receiptId: receipt.id, receiptRef };

    } catch (error: unknown) {
        console.error("Erreur création quittance:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur serveur.";
        return { error: errorMessage };
    }
}

/**
 * Part 9.2: Confirm Payment & Generate Certified Quittance
 */
export async function confirmReceiptPayment(receiptId: string, paymentRef: string) {
    const session = await ensureAuthenticated();
    
    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new Error("Quittance introuvable.");

    // Only Landlords or Agencies can confirm payment
    await ensureLeaseAccess(receipt.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);

    try {
        const paidAt = new Date();
        const qrToken = generateQRToken();

        const receipt = await prisma.$transaction(async (tx) => {
            const r = await tx.receipt.update({
                where: { id: receiptId },
                data: {
                    status: "PAID",
                    paidAt,
                    paymentRef,
                    qrToken
                }
            });

            // Calculate Integrity Hash
            const receiptHash = await calculateReceiptHash({
                leaseId: r.leaseId,
                periodMonth: r.periodMonth,
                totalAmount: r.totalAmount,
                paidAt
            });

            const finalReceipt = await tx.receipt.update({
                where: { id: receiptId },
                data: { receiptHash }
            });

            // Check if this receipt was linked to a CDC Deposit
            const cdcDeposit = await tx.cDCDeposit.findUnique({
                where: { leaseId: r.leaseId }
            });

            if (cdcDeposit && cdcDeposit.status === "AWAITING_PAYMENT") {
                await tx.cDCDeposit.update({
                    where: { leaseId: r.leaseId },
                    data: { 
                        status: "PENDING",
                        consignedAt: paidAt
                    }
                });
            }

            return finalReceipt;
        });

        revalidatePath("/dashboard/receipts");
        return { success: true, receiptRef: receipt.receiptRef, qrToken: receipt.qrToken };

    } catch (error: unknown) {
        console.error("Erreur confirmation paiement:", error);
        return { error: "Impossible de confirmer le paiement." };
    }
}
