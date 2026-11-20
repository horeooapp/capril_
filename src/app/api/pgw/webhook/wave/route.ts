import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/actions/audit";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import { PaymentGateway } from "@/lib/pgw/gateway";

/**
 * PGW-WEBHOOK: Réception des notifications Wave
 * Wave POST une notification quand un paiement est complété.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    console.log("[WAVE WEBHOOK] Notification reçue:", body);

    // 1. Validation de la signature cryptographique Wave (Fail-Closed)
    const waveSignature = req.headers.get("wave-signature");
    const secret = process.env.WAVE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[WAVE WEBHOOK] Erreur: WAVE_WEBHOOK_SECRET non configuré sur le serveur.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!waveSignature) {
      console.error("[WAVE WEBHOOK] Rejet: En-tête wave-signature absent.");
      return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest("hex");

    const sigBuffer = Buffer.from(calculatedSignature, "utf8");
    const waveSigBuffer = Buffer.from(waveSignature, "utf8");

    if (sigBuffer.length !== waveSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, waveSigBuffer)) {
      console.error("[WAVE WEBHOOK] Signature Invalide !");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = body.type;
    const checkoutSessionId = body.id;
    const paymentId = body.client_reference; // On a passé payment.id lors de l'initiation

    if (eventType === "checkout.session.completed") {
      // 2. Mettre à jour la transaction et déclencher les services (Synthèse, Quittance, etc.)
      const payment = await PaymentGateway.confirmPayment(paymentId, checkoutSessionId);

      // --- ADD-05: M-TVA Ventilation ---
      const montantTtc = new Decimal(payment.montant);
      const montantHt = montantTtc.div(1.18);
      const montantTva = montantTtc.minus(montantHt);

      await (prisma as any).tvaTransaction.create({
        data: {
          paymentId: paymentId,
          serviceType: "LOYER",
          montantHt,
          tauxTva: 18.00,
          montantTva,
          montantTtc,
          periodeFiscale: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      });

      // 3. Log d'audit
      await logAction({
        action: "PAYMENT_CONFIRMED",
        module: "PGW",
        entityId: paymentId,
        newValues: { canal: "WAVE", checkoutSessionId },
      });

      console.log(`[WAVE WEBHOOK] Paiement ${paymentId} confirmé.`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[WAVE WEBHOOK] Erreur :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
