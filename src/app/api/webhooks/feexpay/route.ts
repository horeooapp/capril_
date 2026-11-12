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
    let isIntent = false;

    if (paymentId) {
      payment = await (prisma as any).paymentPgw.findUnique({
        where: { id: paymentId },
      });
      if (!payment) {
        payment = await (prisma as any).paymentIntent.findUnique({
          where: { id: paymentId },
          include: { lease: true },
        });
        if (payment) isIntent = true;
      }
    }

    if (!payment) {
      payment = await (prisma as any).paymentPgw.findFirst({
        where: { refInterne: reference },
      });
    }

    if (!payment) {
      payment = await (prisma as any).paymentIntent.findFirst({
        where: { operatorRef: reference },
        include: { lease: true },
      });
      if (payment) isIntent = true;
    }

    if (!payment) {
      // Rechercher par préfixe d'ID extrait de reference (ex: FP-9611d8a2-1794445483348)
      const match = reference.match(/^FP-([a-f0-9-]+)-\d+$/);
      if (match) {
        const idPrefix = match[1];
        payment = await (prisma as any).paymentIntent.findFirst({
          where: { id: { startsWith: idPrefix } },
          include: { lease: true },
        });
        if (payment) isIntent = true;
      }
    }

    if (!payment) {
      console.warn(`[Webhook FeexPay] Paiement introuvable pour ref: ${reference} / paymentId: ${paymentId}`);
      return NextResponse.json({ received: true });
    }

    // Traitement spécifique PaymentIntent (généré depuis le web)
    if (isIntent) {
      if (payment.status === "COMPLETED" || payment.status === "SUCCESS") {
        const quittance = await prisma.receipt.findFirst({
          where: { leaseId: payment.leaseId },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({
          received: true,
          message: "Déjà traité.",
          receiptRef: quittance?.receiptRef || reference,
          receiptId: quittance?.id,
        });
      }

      if (status === "SUCCESSFUL" || status === "SUCCESS") {
        await (prisma as any).paymentIntent.update({
          where: { id: payment.id },
          data: { status: "COMPLETED", operatorRef: reference },
        });

        const monthKey = new Date().toISOString().substring(0, 7);
        const { createAndNotifyReceipt } = await import("@/lib/receipt");
        const receipt = await createAndNotifyReceipt({
          leaseId: payment.leaseId,
          periodMonth: monthKey,
          rentAmount: Math.round(Number(payment.amount) || 0),
          chargesAmount: 0,
          paymentChannel: payment.operator || "FEEXPAY",
          paymentReference: reference,
          receiptType: "RENT",
        });

        try {
          await (prisma as any).paymentPgw.create({
            data: {
              leaseId: payment.leaseId,
              moisConcerne: new Date(),
              payeurId: payment.lease?.tenantId || "",
              beneficiaireId: payment.lease?.landlordId || "",
              montant: payment.amount,
              canal: (payment.operator === "WAVE" ? "WAVE" : "ORANGE") as any,
              statut: "CONFIRMEE",
              refInterne: reference,
              refOperateur: reference,
              quittanceId: receipt.id,
            },
          });
        } catch (e) {
          console.warn("[Webhook FeexPay] PaymentPgw insert error:", e);
        }

        console.log(`[Webhook FeexPay] ✅ PaymentIntent ${payment.id} confirmé. Quittance: ${receipt.receiptRef}`);
        return NextResponse.json({
          received: true,
          success: true,
          receiptRef: receipt.receiptRef,
          receiptId: receipt.id,
        });
      } else if (status === "FAILED" || status === "CANCELLED") {
        await (prisma as any).paymentIntent.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ received: true });
      }
      return NextResponse.json({ received: true });
    }

    // Traitement PaymentPgw (généré depuis le mobile ou API PGW)
    if (payment.statut === "CONFIRMEE") {
      const quittance = await prisma.receipt.findFirst({
        where: { leaseId: payment.leaseId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ 
        received: true, 
        message: "Déjà traité.",
        receiptRef: quittance?.receiptRef || reference,
        receiptId: quittance?.id,
      });
    }

    if (status === "SUCCESSFUL" || status === "SUCCESS") {
      // Confirmer le paiement et déclencher les workflows (Quittance, Scoring, etc.)
      await PaymentGateway.confirmPayment(payment.id, reference);
      console.log(`[Webhook FeexPay] ✅ Paiement ${payment.id} confirmé. Ref: ${reference}`);

      const quittance = await prisma.receipt.findFirst({
        where: { leaseId: payment.leaseId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        received: true,
        success: true,
        receiptRef: quittance?.receiptRef || reference,
        receiptId: quittance?.id,
      });
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
