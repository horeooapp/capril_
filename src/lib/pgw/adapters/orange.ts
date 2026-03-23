import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Orange Money CI Adapter (Stub)
 * Intégration via Orange Money Web Pay API.
 */
export class OrangeAdapter extends PgwAdapter {
  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Orange sessions are usually shorter

    // 1. Créer la transaction dans notre DB
    const payment = await (prisma as any).paymentPgw.create({
      data: {
        leaseId: req.leaseId,
        payeurId: req.payeurId,
        beneficiaireId: req.beneficiaireId,
        montant: req.montant,
        moisConcerne: req.mois,
        canal: "ORANGE",
        msisdnPayeur: req.msisdnPayeur,
        statut: "INITIEE",
        refInterne: `QAPRIL-OM-${req.leaseId}-${req.mois.getTime()}`,
        expiresAt: expiresAt,
      },
    });

    console.log(`[PGW] Stub Orange Money initialisé pour le paiement ${payment.id}`);

    // Simulation de l'URL de paiement Orange
    return {
      paymentId: payment.id,
      status: "INITIEE" as any,
      redirectUrl: `https://orange-money.ci/pay/DEMO-${payment.id}`,
      smsSent: true,
      expiresAt: expiresAt,
    };
  }
}
