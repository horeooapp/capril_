import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
import { prisma } from "@/lib/prisma";

/**
 * MTN MoMo CI Adapter (Stub)
 * Intégration via MTN MoMo API.
 */
export class MtnAdapter extends PgwAdapter {
  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // MTN sessions are usually very short

    // 1. Créer la transaction dans notre DB
    const payment = await (prisma as any).paymentPgw.create({
      data: {
        leaseId: req.leaseId,
        payeurId: req.payeurId,
        beneficiaireId: req.beneficiaireId,
        montant: req.montant,
        moisConcerne: req.mois,
        canal: "MTN",
        msisdnPayeur: req.msisdnPayeur,
        statut: "INITIEE",
        refInterne: `QAPRIL-MTN-${req.leaseId}-${req.mois.getTime()}`,
        expiresAt: expiresAt,
      },
    });

    console.log(`[PGW] Stub MTN MoMo initialisé pour le paiement ${payment.id}`);

    // Simulation de l'URL de paiement MTN
    return {
      paymentId: payment.id,
      status: "INITIEE" as any,
      redirectUrl: `https://mtn-momo.ci/pay/DEMO-${payment.id}`,
      smsSent: true,
      expiresAt: expiresAt,
    };
  }
}
