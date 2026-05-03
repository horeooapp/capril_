import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHmac } from "crypto"

/**
 * Webhook CinetPay pour le module Fiscal M17
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const payload = JSON.parse(rawBody);
        const signature = req.headers.get("x-cinetpay-signature");

        console.log("[WEBHOOK] Received CinetPay fiscal payload:", payload);

        // 1. Vérification de la signature (HMAC-SHA256)
        const secret = process.env.CINETPAY_SIGNATURE_KEY;
        
        if (!secret) {
            console.error("[WEBHOOK] CRITICAL: CINETPAY_SIGNATURE_KEY is not configured.");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (!signature) {
            console.warn("[WEBHOOK] Missing signature header.");
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const hmac = createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");
        
        if (hmac !== signature) {
            console.warn("[WEBHOOK] Invalid CinetPay signature.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const { transaction_id, status } = payload;
        
        if (!transaction_id || typeof transaction_id !== 'string') {
            return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
        }

        const txIdLower = transaction_id.toLowerCase();

        if (!txIdLower.startsWith("fiscal_")) {
            return NextResponse.json({ message: "Not a fiscal transaction" });
        }

        const parts = transaction_id.split("_");
        if (parts.length < 2) {
            return NextResponse.json({ error: "Malformed transaction_id" }, { status: 400 });
        }
        const dossierId = parts[1];

        if (status === "ACCEPTED") {
            // Déclenchement de la génération du certificat (M17) avant de marquer comme PAYE_CONFIRME
            // pour garantir l'atomicité métier
            try {
                const { generateFiscalCert } = await import("@/actions/fiscal-actions");
                await generateFiscalCert(dossierId);
                
                // Si la génération réussit, on met à jour le statut
                await prisma.fiscalDossier.update({
                    where: { id: dossierId },
                    data: {
                        statut: "PAYE_CONFIRME",
                        paidAt: new Date(),
                    }
                });
                console.log(`[WEBHOOK] Fiscal dossier ${dossierId} processed successfully.`);
            } catch (certError) {
                console.error(`[WEBHOOK] Failed to generate certificate for dossier ${dossierId}:`, certError);
                // On marque quand même comme payé mais avec un flag d'erreur ou on laisse en EN_COURS_PAIEMENT pour retry
                return NextResponse.json({ error: "Certificate generation failed" }, { status: 500 });
            }
        } else if (status === "REFUSED") {
            await prisma.fiscalDossier.update({
                where: { id: dossierId },
                data: { statut: "ECHEC_PAIEMENT" }
            });
            console.log(`[WEBHOOK] Fiscal dossier ${dossierId} marked as FAILED.`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("[WEBHOOK] CinetPay error:", error?.message || error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
