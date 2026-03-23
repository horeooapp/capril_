// @ts-ignore
import { PaymentCanal, PaymentPgwStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { detectPaymentCanal } from "./router";
import { PaymentInitiateRequest, PaymentInitiateResponse, PgwAdapter } from "./adapters/base";
import { SMSDeclaratifAdapter } from "./adapters/sms-declaratif";
import { WaveAdapter } from "./adapters/wave";
import { OrangeAdapter } from "./adapters/orange";
import { MtnAdapter } from "./adapters/mtn";

/**
 * QAPRIL Payment Gateway Service
 * Point d'entrée unique pour tous les paiements QAPRIL.
 */
export class PaymentGateway {
  private static adapters: Partial<Record<PaymentCanal, PgwAdapter>> = {
    SMS_DECLARATIF: new SMSDeclaratifAdapter(),
    WAVE: new WaveAdapter(),
    ORANGE: new OrangeAdapter(),
    MTN: new MtnAdapter(),
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
}
