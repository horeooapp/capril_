"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { crypto } from "node:crypto"

export type PaymentOperator = 'orange' | 'mtn' | 'moov' | 'wave';

export type CreatePaymentIntentInput = {
    leaseId: string;
    amount: number;
    operator: PaymentOperator;
    payerPhone: string;
    receiptId?: string; // Optional if existing receipt
};

/**
 * Part 10.1: Create Payment Intent (MM Integration)
 * Standardizes the initial step for all MM operators.
 */
export async function createMMIntent(input: CreatePaymentIntentInput) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    // Generate Idempotency Key
    const idempotencyKey = crypto.createHash('sha256')
        .update(`${input.leaseId}-${input.amount}-${input.payerPhone}-${Date.now()}`)
        .digest('hex');

    try {
        const intent = await prisma.paymentIntent.create({
            data: {
                idempotencyKey,
                leaseId: input.leaseId,
                amount: input.amount,
                operator: input.operator,
                payerPhone: input.payerPhone,
                status: 'pending',
                metadata: { receiptId: input.receiptId }
            }
        });

        revalidatePath("/dashboard/payments");
        return { success: true, intentId: intent.id, idempotencyKey };

    } catch (error: any) {
        console.error("Erreur intent paiement:", error);
        return { error: "Erreur lors de l'initiation du paiement." };
    }
}

/**
 * Part 10.2: Normalized Webhook Handler (Simulation)
 * In a real scenario, this would be an API route, but we implement the logic here.
 */
export async function processMMWebhook(payload: {
    operator: PaymentOperator;
    operatorRef: string;
    idempotencyKey: string;
    status: 'SUCCESS' | 'FAILED';
}) {
    try {
        const intent = await prisma.paymentIntent.findUnique({
            where: { idempotencyKey: payload.idempotencyKey }
        });

        if (!intent) throw new Error("Intent introuvable.");
        if (intent.status !== 'pending') return { success: true, message: "Déjà traité." };

        const updatedIntent = await prisma.$transaction(async (tx) => {
            const result = await tx.paymentIntent.update({
                where: { id: intent.id },
                data: {
                    status: payload.status === 'SUCCESS' ? 'success' : 'failed',
                    operatorRef: payload.operatorRef,
                }
            });

            // If success, update the linked receipt (if any) or create one
            if (payload.status === 'SUCCESS') {
                const metadata = intent.metadata as any;
                if (metadata?.receiptId) {
                    // Update existing pending receipt
                    // This logic would ideally call confirmation actions
                }
            }

            return result;
        });

        return { success: true, status: updatedIntent.status };

    } catch (error: any) {
        console.error("Erreur traitement webhook:", error);
        return { error: "Erreur traitement webhook." };
    }
}
