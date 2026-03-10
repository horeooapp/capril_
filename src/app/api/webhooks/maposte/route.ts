import { NextRequest, NextResponse } from "next/server";
import { processMaPosteWebhook } from "@/lib/maposte";
import { sendSMS } from "@/lib/sms";
import { prisma } from "@/lib/prisma";

/**
 * Part 19.5: MaPoste Inbound Webhook
 * Receives delivery confirmations from La Poste CI
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Basic signature validation (In production: HMAC check)
        const signature = req.headers.get("X-MaPoste-Signature");
        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
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
