import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentGateway } from "@/lib/pgw/gateway";

/**
 * Webhook FeexPay — Notifications de transaction (Payin)
 * Docs : https://docs.feexpay.me/?section=webhook
 *
 * FeexPay envoie un POST avec le status final de la transaction.
 * Ce webhook met à jour le paiement en base et déclenche les workflows métier.
 */
export async function POST(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get("paymentId");
    const body = await request.json();

    console.log("[Webhook FeexPay] Reçu :", JSON.stringify(body));

    const { reference, status, amount, phoneNumber } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { error: "Payload incomplet : reference et status requis." },
        { status: 400 }
      );
    }

    // Trouver le paiement via l'ID fourni en query param ou via la référence opérateur
    let payment = null;

    if (paymentId) {
      payment = await (prisma as any).paymentPgw.findUnique({
        where: { id: paymentId },
      });
    }

    if (!payment) {
      payment = await (prisma as any).paymentPgw.findFirst({
        where: { refInterne: reference },
      });
    }

    if (!payment) {
      console.warn(`[Webhook FeexPay] Paiement introuvable pour ref: ${reference} / paymentId: ${paymentId}`);
      // Retourner 200 pour éviter que FeexPay ne reessaie indéfiniment
      return NextResponse.json({ received: true });
    }

    // Idempotence : ne pas retraiter un paiement déjà confirmé
    if (payment.statut === "CONFIRMEE") {
      return NextResponse.json({ received: true, message: "Déjà traité." });
    }

    if (status === "SUCCESSFUL" || status === "SUCCESS") {
      // Confirmer le paiement et déclencher les workflows (Quittance, Scoring, etc.)
      await PaymentGateway.confirmPayment(payment.id, reference);
      console.log(`[Webhook FeexPay] ✅ Paiement ${payment.id} confirmé. Ref: ${reference}`);
    } else if (status === "FAILED" || status === "CANCELLED") {
      await (prisma as any).paymentPgw.update({
        where: { id: payment.id },
        data: { statut: "ECHOUEE" },
      });
      console.log(`[Webhook FeexPay] ❌ Paiement ${payment.id} échoué. Status: ${status}`);
    } else {
      // PENDING ou autre état intermédiaire — on log et on attend
      console.log(`[Webhook FeexPay] ⏳ Paiement ${payment.id} en attente. Status: ${status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook FeexPay] Erreur:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "FeexPay webhook endpoint actif." });
}
