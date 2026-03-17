"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "node:crypto"
import { cinetpay } from "@/lib/cinetpay"

export type PaymentOperator = 'orange' | 'mtn' | 'moov' | 'wave';

export type CreatePaymentIntentInput = {
    leaseId: string;
    amount: number;
    monthsCount: number; // Required to check legal approval for prepayments
    operator: PaymentOperator;
    payerPhone: string;
    receiptId?: string; // Optional if existing receipt
};

interface PaymentIntentMetadata {
    receiptId?: string;
    monthsCount?: number;
    [key: string]: any;
}

/**
 * Part 10.1: Create Payment Intent (MM Integration)
 * Standardizes the initial step for all MM operators.
 * Now includes mandatory check for multi-month prepayment approval.
 */
export async function createMMIntent(input: CreatePaymentIntentInput) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    // --- NEW: Prepayment Legal Check (Part 10.1a) ---
    if (input.monthsCount > 1) {
        const approvedRequest = await prisma.prepaymentRequest.findFirst({
            where: {
                leaseId: input.leaseId,
                tenantId: session.user.id,
                monthsCount: input.monthsCount,
                status: 'APPROVED'
            }
        });

        if (!approvedRequest) {
            return { 
                error: "Droit de refus du propriétaire : Pour payer plusieurs mois d'avance, vous devez d'abord obtenir l'approbation du propriétaire." 
            };
        }
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
                status: 'PENDING',
                metadata: { 
                    receiptId: input.receiptId,
                    monthsCount: input.monthsCount
                }
            }
        });

        // 2. Initialize CinetPay Payment
        const paymentResult = await cinetpay.initializePayment({
            transaction_id: intent.id,
            amount: input.amount,
            currency: "XOF",
            description: `Règlement Loyer - Contrat ${input.leaseId} (${input.monthsCount} mois)`,
            customer_name: session.user.name || session.user.fullName || "Locataire",
            customer_surname: "QAPRIL",
            customer_email: session.user.email || "client@qapril.ci",
            customer_phone_number: input.payerPhone,
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cinetpay`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/status?tid=${intent.id}`,
            channels: "ALL" // Handles both MM and Cards via CinetPay
        });

        if (!paymentResult.success) {
            await prisma.paymentIntent.update({
                where: { id: intent.id },
                data: { status: 'FAILED', metadata: { ...(intent.metadata as any), error: paymentResult.message } }
            });
            return { error: paymentResult.message };
        }

        // --- Mark Prepayment Request as COMPLETED if it was used ---
        if (input.monthsCount > 1) {
            await prisma.prepaymentRequest.updateMany({
                where: {
                    leaseId: input.leaseId,
                    monthsCount: input.monthsCount,
                    status: 'APPROVED'
                },
                data: { status: 'COMPLETED' }
            });
        }

        revalidatePath("/dashboard/payments");
        return { 
            success: true, 
            intentId: intent.id, 
            paymentUrl: paymentResult.payment_url,
            paymentToken: paymentResult.payment_token
        };

    } catch (error: unknown) {
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
        if (intent.status !== 'PENDING') return { success: true, message: "Déjà traité." };

        const updatedIntent = await prisma.$transaction(async (tx) => {
            const result = await tx.paymentIntent.update({
                where: { id: intent.id },
                data: {
                    status: payload.status,
                    operatorRef: payload.operatorRef,
                }
            });

            // If success, update the linked receipt (if any) or create one
            if (payload.status === 'SUCCESS') {
                const metadata = intent.metadata as Record<string, any>;
                if (metadata?.receiptId) {
                    // Update existing pending receipt
                    // This logic would ideally call confirmation actions
                }
            }

            return result;
        });

        return { success: true, status: updatedIntent.status };

    } catch (error: unknown) {
        console.error("Erreur traitement webhook:", error);
        return { error: "Erreur traitement webhook." };
    }
}
