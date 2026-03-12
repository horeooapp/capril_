import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CDCDepositStatus } from "@prisma/client";
import { logAction } from "@/actions/audit";

/**
 * Part 10.2: CDC-CI Webhook Receiver
 * Handles automated consignation confirmations from Caisse des Dépôts et Consignations.
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const { depositId, cdcReference, status, signature } = payload;

        // 1. Verify Signature (Simulated for v3.0)
        // In prod, use HMAC-SHA256 with a secret key
        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        // 2. Find the deposit
        const deposit = await prisma.cDCDeposit.findUnique({
            where: { id: depositId }
        });

        if (!deposit) {
            return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
        }

        // 3. Update status
        const updatedDeposit = await prisma.cDCDeposit.update({
            where: { id: depositId },
            data: {
                status: status === "SUCCESS" ? CDCDepositStatus.CONSIGNED : deposit.status,
                cdcReference: cdcReference || deposit.cdcReference,
                consignedAt: status === "SUCCESS" ? new Date() : deposit.consignedAt
            }
        });

        // 4. Log the system action
        await logAction({
            action: "CDC_WEBHOOK_PROCESSED",
            module: "CDC_DEPOSIT",
            entityId: depositId,
            newValues: { status, cdcReference }
        });

        // 5. Save to WebhookEvents for audit trail
        await prisma.webhookEvent.create({
            data: {
                operator: "CDCCI",
                eventType: "DEPOSIT_CONFIRMATION",
                payload,
                signatureValid: true,
                processed: true
            }
        });

        return NextResponse.json({ success: true, depositId: updatedDeposit.id });

    } catch (error) {
        console.error("[CDC_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
