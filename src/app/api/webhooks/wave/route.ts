import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processSplitPayment } from "@/actions/reversal";
import { createAndNotifyReceipt } from "@/lib/receipt";
import * as crypto from "crypto";

/**
 * Wave Webhook Handler
 * Endpoint: /api/webhooks/wave
 */
export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-wave-signature");
        
        // Security: Header Check
        if (!signature && process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        // TODO: Actual Ed25519 verification with WAVE_PUBLIC_KEY if provided
        // const isValid = crypto.verify(null, Buffer.from(bodyText), WAVE_PUBLIC_KEY, Buffer.from(signature, 'base64'));

        const body = JSON.parse(bodyText);
        const { id, type, data } = body;

        // Verify event type
        if (type !== "checkout.session.completed") {
            return NextResponse.json({ status: "ignored" });
        }

        const paymentId = data.client_reference;

        if (!paymentId) {
            return NextResponse.json({ error: "No payment reference found" }, { status: 400 });
        }

        // 1. Double check with Intent
        const intent = await prisma.paymentIntent.findUnique({
            where: { id: paymentId },
            include: { lease: { include: { property: true, tenant: true, landlord: true } } }
        });

        if (!intent) {
            console.error(`[WAVE_WEBHOOK] Intent ${paymentId} not found`);
            return NextResponse.json({ error: "Intent not found" }, { status: 404 });
        }

        if (intent.status === "SUCCESS") {
            return NextResponse.json({ status: "already_processed" });
        }

        // 2. Atomic Update & Automation
        await prisma.$transaction(async (tx) => {
            // Update Intent
            await tx.paymentIntent.update({
                where: { id: paymentId },
                data: {
                    status: "SUCCESS",
                    operatorRef: id,
                    metadata: {
                        ...(intent.metadata as any),
                        payment_method: "WAVE"
                    }
                }
            });

            // Trigger M-DOC-AUTO (Receipt)
            const metadata = intent.metadata as any;
            if (!metadata?.receiptId && metadata?.periodMonth) {
                const receipt = await createAndNotifyReceipt({
                    leaseId: intent.leaseId,
                    periodMonth: metadata.periodMonth,
                    rentAmount: intent.amount - (metadata.chargesAmount || 0),
                    chargesAmount: metadata.chargesAmount || 0,
                    paymentChannel: "WAVE",
                    paymentReference: id,
                    receiptType: "RENT",
                    bypassPaywall: true
                });
                
                // Track in intent
                await tx.paymentIntent.update({
                    where: { id: paymentId },
                    data: {
                        metadata: { ...metadata, receiptId: receipt.id }
                    }
                });
            }

            // Create PaymentPgw (M-PGW)
            await tx.paymentPgw.create({
                data: {
                    leaseId: intent.leaseId,
                    moisConcerne: new Date(),
                    montant: intent.amount,
                    payeurId: intent.lease.tenantId || "SYSTEM",
                    beneficiaireId: intent.lease.landlordId,
                    canal: "WAVE" as any,
                    statut: "CONFIRMEE",
                    refInterne: intent.id,
                    refOperateur: id,
                    webhookPayload: body as any,
                    webhookReceivedAt: new Date()
                }
            });
        });

        // 3. Trigger M-PAY-AUTO (Split & Reversal)
        await processSplitPayment(paymentId).catch(e => console.error("Split failed", e));

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("[WAVE_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
