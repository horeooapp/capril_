import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
import { PaymentPgwStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Wave CI Adapter (Sprint 2)
 * Intégration directe via Wave Business API (0% frais).
 */
export class WaveAdapter extends PgwAdapter {
  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Session Wave 24h

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

    // 2. Appel API Wave (Squelette)
    // const response = await fetch("https://api.wave.com/v1/checkout/sessions", { ... });
    // const data = await response.json();
    const waveLaunchUrl = `https://pay.wave.com/m/DEMO-${payment.id}`; // URL simulée

    console.log(`[PGW] Session Wave créée pour le paiement ${payment.id}`);

    return {
      paymentId: payment.id,
      status: "INITIEE" as any,
      redirectUrl: waveLaunchUrl,
      smsSent: true, // QAPRIL envoie le lien par SMS via Infobip
      expiresAt: expiresAt,
    };
  }
}
