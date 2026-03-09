"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateReceiptRef, generateQRToken, calculateReceiptHash } from "@/lib/financial-utils"
import { Role } from "@prisma/client"

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
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

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
                status: 'pending'
            }
        });

        // Trigger CDC logic if it's a security deposit
        if (input.isDeposit) {
            await prisma.cDCDeposit.upsert({
                where: { leaseId: lease.id },
                update: { amount: totalAmount, status: 'awaiting_payment' },
                create: {
                    leaseId: lease.id,
                    amount: totalAmount,
                    status: 'awaiting_payment'
                }
            });
        }

        revalidatePath("/dashboard/receipts");
        return { success: true, receiptId: receipt.id, receiptRef };

    } catch (error: any) {
        console.error("Erreur création quittance:", error);
        return { error: error.message || "Erreur serveur." };
    }
}

/**
 * Part 9.2: Confirm Payment & Generate Certified Quittance
 */
export async function confirmReceiptPayment(receiptId: string, paymentRef: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.LANDLORD, Role.AGENCY, Role.LANDLORD_PRO];
    
    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Accès non autorisé.");
    }

    try {
        const paidAt = new Date();
        const qrToken = generateQRToken();

        const receipt = await prisma.$transaction(async (tx) => {
            const r = await tx.receipt.update({
                where: { id: receiptId },
                data: {
                    status: 'paid',
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

            if (cdcDeposit && cdcDeposit.status === 'awaiting_payment') {
                await tx.cDCDeposit.update({
                    where: { leaseId: r.leaseId },
                    data: { 
                        status: 'payment_initiated',
                        consignedAt: paidAt
                    }
                });
            }

            return finalReceipt;
        });

        revalidatePath("/dashboard/receipts");
        return { success: true, receiptRef: receipt.receiptRef, qrToken: receipt.qrToken };

    } catch (error: any) {
        console.error("Erreur confirmation paiement:", error);
        return { error: "Impossible de confirmer le paiement." };
    }
}
