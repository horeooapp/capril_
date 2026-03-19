import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cinetpay } from "@/lib/cinetpay";
import { createReceipt } from "@/actions/receipts";
import { PRICING } from "@/constants/pricing";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * CinetPay Webhook Handler
 * Endpoint: /api/webhooks/cinetpay
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const transaction_id = formData.get("cpm_trans_id")?.toString();
        const site_id = formData.get("cpm_site_id")?.toString();

        if (!transaction_id || !site_id) {
            return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        // 1. Double check with CinetPay API (Verification)
        const verification = await cinetpay.verifyPayment(transaction_id);

        if (!verification.success || verification.status !== "ACCEPTED") {
            console.warn(`[CINETPAY_WEBHOOK] Transaction ${transaction_id} not accepted: ${verification.status}`);
            return NextResponse.json({ status: "acknowledged" });
        }

        // 2. Find the local PaymentIntent
        const intent = await prisma.paymentIntent.findUnique({
            where: { id: transaction_id },
            include: { lease: true }
        });

        if (!intent) {
            console.error(`[CINETPAY_WEBHOOK] Intent ${transaction_id} not found`);
            return NextResponse.json({ error: "Intent not found" }, { status: 404 });
        }

        if (intent.status === "SUCCESS") {
            return NextResponse.json({ status: "already_processed" });
        }

        // 3. atomic update and receipt generation
        await prisma.$transaction(async (tx) => {
            // Update Intent
            await tx.paymentIntent.update({
                where: { id: intent.id },
                data: {
                    status: "SUCCESS",
                    operatorRef: verification.operator_id || "CINETPAY",
                    metadata: {
                        ...(intent.metadata as any),
                        payment_method: verification.payment_method
                    }
                }
            });

            const metadata = intent.metadata as any;

            // Generate Receipt if it doesn't exist yet
            if (!metadata?.receiptId) {
                // We use the createReceipt server action logic but inside the transaction
                // Note: createReceipt is a server action, here we might need a lib function
                // For now, let's assume we have a lib function or we just call the action's core
                
                // TODO: Ensure createReceipt is safe to call or extract its logic to a lib
            } else {
                // Update existing receipt to 'paid'
                await tx.receipt.update({
                    where: { id: metadata.receiptId },
                    data: {
                        status: "paid",
                        paidAt: new Date(),
                        paymentRef: verification.operator_id
                    }
                });
            }

            // --- ADD-05: M-TVA Ventilation ---
            const montantTtc = new Decimal(intent.amount);
            const montantHt = montantTtc.div(1.18);
            const montantTva = montantTtc.minus(montantHt);
            
            await tx.tvaTransaction.create({
                data: {
                    paymentId: intent.id, // ID must match the relation
                    serviceType: metadata?.serviceType || "LOYER",
                    montantHt,
                    tauxTva: 18.00,
                    montantTva,
                    montantTtc,
                    periodeFiscale: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            });
        });

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("[CINETPAY_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
