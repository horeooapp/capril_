import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processSplitPayment } from "@/actions/reversal";

/**
 * Wave Webhook Handler
 * Endpoint: /api/webhooks/wave
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, type, data } = body;

        // Verify event type
        if (type !== "checkout.session.completed") {
            return NextResponse.json({ status: "ignored" });
        }

        const paymentId = data.client_reference;

        if (!paymentId) {
            return NextResponse.json({ error: "No payment reference found" }, { status: 400 });
        }

        // 1. Update Payment Status to SUCCESS
        const payment = await (prisma as any).paymentPgw.update({
            where: { id: paymentId },
            data: {
                statut: "CONFIRMEE",
                webhookPayload: body,
                webhookReceivedAt: new Date(),
                refOperateur: id, // Wave event ID
            }
        });

        console.log(`[WAVE_WEBHOOK] Payment ${paymentId} successfully confirmed.`);

        // 2. Trigger M-PAY-AUTO (Automatic Split & Reversal)
        const reversalResult = await processSplitPayment(paymentId);

        if (!reversalResult.success) {
            console.error(`[WAVE_WEBHOOK] Split payment failed for ${paymentId}:`, reversalResult.error);
        }

        return NextResponse.json({ status: "success" });

    } catch (error) {
        console.error("[WAVE_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
