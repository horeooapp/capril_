import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cinetpay } from "@/lib/cinetpay";
import { createAndNotifyReceipt } from "@/lib/receipt";
import { PaymentCanal, PaymentPgwStatus } from "@prisma/client";

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

            if (metadata?.type === "FISCAL_REGISTRATION") {
                const { FiscalService } = await import("@/lib/fiscal-service");
                await FiscalService.confirmerPaiementFiscal(intent.leaseId, transaction_id, verification.operator_id);
                console.log(`[CINETPAY_WEBHOOK] Paiement FISCAL confirmé pour le bail ${intent.leaseId}`);
                return; // On arrête ici pour le fiscal (pas de quittance standard)
            }

            // Generate Receipt if it doesn't exist yet (M-DOC-AUTO)
            if (!metadata?.receiptId && metadata?.periodMonth) {
                const receipt = await createAndNotifyReceipt({
                    leaseId: intent.leaseId,
                    periodMonth: metadata.periodMonth,
                    rentAmount: intent.amount - (metadata.chargesAmount || 0),
                    chargesAmount: metadata.chargesAmount || 0,
                    paymentChannel: verification.payment_method || "MOBILE_MONEY",
                    paymentReference: verification.operator_id || "CINETPAY",
                    receiptType: "RENT",
                    bypassPaywall: true // Payment already made via PGW
                });
                
                // Update metadata with receipt info
                await tx.paymentIntent.update({
                    where: { id: intent.id },
                    data: {
                        metadata: {
                            ...metadata,
                            receiptId: receipt.id,
                            receiptRef: (receipt as any).receiptRef
                        }
                    }
                });
            } else if (metadata?.receiptId) {
                // Update existing receipt to 'paid'
                await tx.receipt.update({
                    where: { id: metadata.receiptId },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        paymentRef: verification.operator_id
                    }
                });
            }

            // --- ADD-05: M-PGW Integration ---
            // Create the unified PaymentPgw record
            const pgw = await tx.paymentPgw.create({
                data: {
                    leaseId: intent.leaseId,
                    moisConcerne: new Date(),
                    montant: intent.amount,
                    payeurId: intent.lease.tenantId || "SYSTEM",
                    beneficiaireId: intent.lease.landlordId,
                    canal: PaymentCanal.CINETPAY_M17,
                    statut: PaymentPgwStatus.CONFIRMEE,
                    refInterne: intent.id,
                    refCinetpay: transaction_id,
                    refOperateur: verification.operator_id,
                    webhookPayload: verification as any,
                    webhookReceivedAt: new Date()
                }
            });

            // --- ADD-05: M-TVA Ventilation ---
            const montantTtc = intent.amount;
            const montantHt = Math.round(montantTtc / 1.18);
            const montantTva = montantTtc - montantHt;
            
            await tx.tvaTransaction.create({
                data: {
                    paymentId: pgw.id, 
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
