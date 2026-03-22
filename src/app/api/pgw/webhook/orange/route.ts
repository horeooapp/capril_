import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/actions/audit";

/**
 * PGW-WEBHOOK: Réception des notifications Orange Money WebPay
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    console.log("[ORANGE WEBHOOK] Notification reçue:", body);

    // 1. Validation basique (token symétrique)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ORANGE_WEBHOOK_SECRET}`) {
       console.error("[ORANGE WEBHOOK] Unauthorized request");
       if (process.env.NODE_ENV === "production") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }
    }

    // Le format dépend de l'API Orange (souvent { status, txntoken, ... })
    const { status, txntoken, notif_token } = body;

    if (status === "SUCCESS" || status === "SUCCESSFUL") {
      const payment = await (prisma as any).paymentPgw.update({
        where: { id: txntoken || body.order_id },
        data: {
          statut: "CONFIRMEE",
          refOperateur: notif_token || body.pay_token,
          updatedAt: new Date(),
        },
      });

      if (payment) {
        await logAction({
          action: "PAYMENT_CONFIRMED",
          module: "PGW",
          entityId: payment.id,
          newValues: { canal: "ORANGE", notif_token },
        });
        console.log(`[ORANGE WEBHOOK] Paiement ${payment.id} confirmé.`);
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[ORANGE WEBHOOK] Erreur :", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
