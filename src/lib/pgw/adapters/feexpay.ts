import { PgwAdapter, PaymentInitiateRequest, PaymentInitiateResponse } from "./base";
import { prisma } from "@/lib/prisma";

/**
 * FeexPay Adapter — Côte d'Ivoire
 * Couvre : MTN CI, Orange CI, Moov CI, Wave CI
 * Docs : https://docs.feexpay.me/?section=api-rest-integrations
 */

const FEEXPAY_API_URL =
  process.env.FEEXPAY_SANDBOX === "true"
    ? "https://sandbox-api.feexpay.me"
    : "https://api.feexpay.me";

/** Map canal QAPRIL → identifiant réseau FeexPay */
const CANAL_TO_FEEXPAY_NETWORK: Record<string, string> = {
  MTN: "mtn_ci",
  ORANGE: "orange_ci",
  MOOV: "moov_ci",
  WAVE: "wave_ci",
};

/**
 * Effectue un payin via l'API REST FeexPay.
 * Endpoint : POST /api/transactions/public/requesttopay/{network}
 */
async function feexpayRequestToPay(
  network: string,
  phoneNumber: string,
  amount: number,
  callbackUrl?: string
): Promise<{ reference: string; status: string; message: string }> {
  const apiKey = process.env.FEEXPAY_API_KEY;
  const shopId = process.env.FEEXPAY_SHOP_ID;

  if (!apiKey || !shopId) {
    throw new Error("[FeexPay] Variables d'environnement manquantes : FEEXPAY_API_KEY ou FEEXPAY_SHOP_ID");
  }

  const body: Record<string, unknown> = {
    shop: shopId,
    amount,
    phoneNumber,
  };

  if (callbackUrl) {
    body.callback_url = callbackUrl;
  }

  const response = await fetch(
    `${FEEXPAY_API_URL}/api/transactions/public/requesttopay/${network}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `[FeexPay] Erreur API (${response.status}) : ${JSON.stringify(data)}`
    );
  }

  return {
    reference: data.reference,
    status: data.status ?? "PENDING",
    message: data.message ?? "",
  };
}

/**
 * Adaptateur FeexPay générique pour MTN CI, Orange CI, Moov CI, Wave CI.
 * Usage : instancier avec le canal QAPRIL (ex: "MTN", "ORANGE", "MOOV", "WAVE").
 */
export class FeexpayAdapter extends PgwAdapter {
  private canal: string;

  constructor(canal: "MTN" | "ORANGE" | "MOOV" | "WAVE") {
    super();
    this.canal = canal;
  }

  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const network = CANAL_TO_FEEXPAY_NETWORK[this.canal];
    if (!network) {
      throw new Error(`[FeexPay] Canal inconnu : ${this.canal}`);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://qapril.net";
    const callbackUrl = `${appUrl}/api/webhooks/feexpay?paymentId=PLACEHOLDER`;

    // 1. Créer la transaction en base
    const payment = await (prisma as any).paymentPgw.create({
      data: {
        leaseId: req.leaseId,
        payeurId: req.payeurId,
        beneficiaireId: req.beneficiaireId,
        montant: req.montant,
        moisConcerne: req.mois,
        canal: this.canal,
        msisdnPayeur: req.msisdnPayeur,
        statut: "INITIEE",
        refInterne: `QAPRIL-FEEXPAY-${this.canal}-${req.leaseId}-${req.mois.getTime()}`,
        expiresAt,
      },
    });

    const webhookCallbackUrl = `${appUrl}/api/webhooks/feexpay?paymentId=${payment.id}`;

    try {
      // 2. Appel API FeexPay
      const result = await feexpayRequestToPay(
        network,
        req.msisdnPayeur,
        req.montant,
        webhookCallbackUrl
      );

      console.log(
        `[PGW FeexPay] ${this.canal} — paiement ${payment.id} initié. Ref: ${result.reference} | Status: ${result.status}`
      );

      // 3. Sauvegarder la référence opérateur
      await (prisma as any).paymentPgw.update({
        where: { id: payment.id },
        data: { refInterne: result.reference },
      });

      return {
        paymentId: payment.id,
        status: "INITIEE" as any,
        smsSent: true,
        expiresAt,
      };
    } catch (error) {
      console.error(
        `[PGW FeexPay] Échec initiation ${this.canal} pour paiement ${payment.id} :`,
        error
      );
      // Mise à jour du statut en erreur
      await (prisma as any).paymentPgw.update({
        where: { id: payment.id },
        data: { statut: "ECHOUEE" },
      });
      throw error;
    }
  }
}
