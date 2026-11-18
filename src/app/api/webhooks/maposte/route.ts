import { NextRequest, NextResponse } from "next/server";
import { processMaPosteWebhook } from "@/lib/maposte";
import { sendSMS } from "@/lib/sms";
import { prisma } from "@/lib/prisma";
import { checkWebhookSignature } from "@/lib/security";

/**
 * Part 19.5: MaPoste Inbound Webhook
 * Receives delivery confirmations from La Poste CI
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("X-MaPoste-Signature");
        const secret = process.env.MAPOSTE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

        if (secret) {
            if (!signature) {
                return NextResponse.json({ error: "Missing signature" }, { status: 401 });
            }
            const isValid = await checkWebhookSignature(rawBody, signature, secret);
            if (!isValid) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        } else if (process.env.NODE_ENV === "production") {
            if (!signature) {
                return NextResponse.json({ error: "Missing signature" }, { status: 401 });
            }
        }

        let payload: any;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const result = await processMaPosteWebhook({
            trackingNumber: payload.trackingNumber || payload.numero_suivi,
            event: payload.event || payload.evenement,
            timestamp: payload.timestamp || new Date().toISOString(),
            recipientPhone: payload.recipientPhone || payload.telephone_destinataire
        });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        // SMS notification on status change
        if (result.newStatus && result.trackingNumber) {
            const statusLabels: Record<string, string> = {
                in_transit: "Votre courrier est en route",
                delivered: "Votre courrier a été livré avec succès",
                attempted: "Tentative de livraison échouée",
                returned: "Votre courrier a été retourné"
            };

            const label = statusLabels[result.newStatus];
            if (label) {
                // Find the landlord linked to this delivery
                const delivery = await prisma.digitalDelivery.findUnique({
                    where: { trackingNumber: result.trackingNumber },
                    include: { receipts: { include: { lease: { include: { landlord: true } } } } }
                });

                const landlordPhone = delivery?.receipts?.[0]?.lease?.landlord?.phone;
                if (landlordPhone) {
                    await sendSMS(landlordPhone, `📬 ${label} - Réf: ${result.trackingNumber}`);
                }
            }
        }

        return NextResponse.json({ received: true, ...result });

    } catch (error) {
        console.error("[MaPoste Webhook Error]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
