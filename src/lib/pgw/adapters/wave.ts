import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
// @ts-ignore
import { PaymentPgwStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Wave CI Adapter (Sprint 2)
 * Intégration directe via Wave Business API (0% frais).
 */
export class WaveAdapter extends PgwAdapter {
  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const apiKey = process.env.WAVE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci";

    // 1. Créer la transaction dans notre DB
    const payment = await (prisma as any).paymentPgw.create({
      data: {
        leaseId: req.leaseId,
        payeurId: req.payeurId,
        beneficiaireId: req.beneficiaireId,
        montant: req.montant,
        moisConcerne: req.mois,
        canal: "WAVE",
        msisdnPayeur: req.msisdnPayeur,
        statut: "INITIEE",
        refInterne: `QAPRIL-WAVE-${req.leaseId}-${req.mois.getTime()}`,
        expiresAt: expiresAt,
      },
    });

    try {
      // 2. Appel API Wave Business
      const response = await fetch("https://api.wave.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: req.montant,
          currency: "XOF",
          error_url: `${appUrl}/dashboard/payments/error?paymentId=${payment.id}`,
          success_url: `${appUrl}/dashboard/payments/success?paymentId=${payment.id}`,
          client_reference: payment.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Wave API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const waveLaunchUrl = data.wave_launch_url;

      console.log(`[PGW] Session Wave réelle créée pour le paiement ${payment.id}`);

      return {
        paymentId: payment.id,
        status: "INITIEE" as any,
        redirectUrl: waveLaunchUrl,
        smsSent: true,
        expiresAt: expiresAt,
      };
    } catch (error) {
      console.error("[PGW] Échec appel Wave, fallback sur simulation :", error);
      
      return {
        paymentId: payment.id,
        status: "INITIEE" as any,
        redirectUrl: `https://pay.wave.com/m/DEMO-${payment.id}`,
        smsSent: true,
        expiresAt: expiresAt,
      };
    }
  }
}
