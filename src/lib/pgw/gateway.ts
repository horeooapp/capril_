// @ts-ignore
import { PaymentCanal, PaymentPgwStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { detectPaymentCanal } from "./router";
import { PaymentInitiateRequest, PaymentInitiateResponse, PgwAdapter } from "./adapters/base";
import { SMSDeclaratifAdapter } from "./adapters/sms-declaratif";
import { WaveAdapter } from "./adapters/wave";
import { FeexpayAdapter } from "./adapters/feexpay";

/**
 * QAPRIL Payment Gateway Service
 * Point d'entrée unique pour tous les paiements QAPRIL.
 *
 * Canal coverage :
 * - WAVE     → Wave Business API directe
 * - MTN      → FeexPay (requesttopay/mtn_ci)
 * - ORANGE   → FeexPay (requesttopay/orange_ci)
 * - MOOV     → FeexPay (requesttopay/moov_ci)
 */
export class PaymentGateway {
  private static adapters: Partial<Record<PaymentCanal, PgwAdapter>> = {
    SMS_DECLARATIF: new SMSDeclaratifAdapter(),
    WAVE: new WaveAdapter(),
    MTN: new FeexpayAdapter("MTN"),
    ORANGE: new FeexpayAdapter("ORANGE"),
    MOOV: new FeexpayAdapter("MOOV"),
  };

  /**
   * Initie un paiement en détectant automatiquement le canal.
   */
  static async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // 1. Détection du canal
    let canal: PaymentCanal = "SMS_DECLARATIF" as any; // Fallback par défaut

    if (req.forceCanal) {
      canal = req.forceCanal as PaymentCanal;
    } else {
      const detected = detectPaymentCanal(req.msisdnPayeur);
      if (detected) canal = detected;
    }

    // 2. Sélection de l'adaptateur
    const adapter = (this.adapters as any)[canal] || (this.adapters as any)["SMS_DECLARATIF"];

    if (!adapter) {
      throw new Error(`Aucun adaptateur disponible pour le canal : ${canal}`);
    }

    // 3. Exécution
    return await adapter.initiate(req);
  }

  /**
   * Confirme un paiement et déclenche les workflows métier (Quittance, Synthèse, Scoring).
   */
  static async confirmPayment(paymentId: string, operatorRef: string) {
    const payment = await prisma.paymentPgw.findUnique({
      where: { id: paymentId },
      include: { lease: true }
    });

    if (!payment) throw new Error("Paiement PGW introuvable.");
    if (payment.statut === "CONFIRMEE") return payment; // Déjà traité

    // 1. Mise à jour de la transaction
    const updatedPayment = await prisma.paymentPgw.update({
      where: { id: paymentId },
      data: {
        statut: "CONFIRMEE",
        refOperateur: operatorRef,
        updatedAt: new Date(),
      },
    });

    // 2. Mise à jour de la synthèse mensuelle (MonthlyRentSynthesis)
    const monthKey = payment.moisConcerne.toISOString().substring(0, 7); // YYYY-MM
    const synthesis = await prisma.monthlyRentSynthesis.findUnique({
      where: {
        leaseId_month: {
          leaseId: payment.leaseId,
          month: monthKey,
        },
      },
    });

    if (synthesis) {
      await prisma.monthlyRentSynthesis.update({
        where: { id: synthesis.id },
        data: {
          amountCollected: { increment: payment.montant },
          status: (synthesis.amountCollected + payment.montant) >= synthesis.totalExpected ? "PAID" : "PARTIAL",
        },
      });
    }

    // 3. Génération de Quittance (Receipt)
    const { createAndNotifyReceipt } = await import("../receipt");
    await createAndNotifyReceipt({
      leaseId: payment.leaseId,
      periodMonth: monthKey,
      rentAmount: payment.montant,
      chargesAmount: 0,
      paymentChannel: payment.canal,
      paymentReference: operatorRef,
      receiptType: "RENT",
    });

    return updatedPayment;
  }
}
