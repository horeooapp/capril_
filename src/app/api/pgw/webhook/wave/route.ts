import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/actions/audit";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * PGW-WEBHOOK: Réception des notifications Wave
 * Wave POST une notification quand un paiement est complété.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[WAVE WEBHOOK] Notification reçue:", body);

    // 1. Validation de la signature (Optionnel selon le secret configuré)
    // const signature = req.headers.get("wave-signature");
    // TODO: Implémenter la validation réelle avec process.env.WAVE_WEBHOOK_SECRET

    const eventType = body.type;
    const checkoutSessionId = body.id;
    const paymentId = body.client_reference; // On a passé payment.id lors de l'initiation

    if (eventType === "checkout.session.completed") {
      // 2. Mettre à jour la transaction en DB
      const payment = await (prisma as any).paymentPgw.update({
        where: { id: paymentId },
        data: {
          statut: "CONFIRMEE",
          refOperateur: checkoutSessionId,
          updatedAt: new Date(),
        },
      });

      // --- ADD-05: M-TVA Ventilation ---
      const montantTtc = new Decimal(payment.montant);
      const montantHt = montantTtc.div(1.18);
      const montantTva = montantTtc.minus(montantHt);

      await (prisma as any).tvaTransaction.create({
        data: {
          paymentId: paymentId,
          serviceType: payment.motif || "LOYER",
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
