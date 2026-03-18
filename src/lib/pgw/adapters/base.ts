import { PaymentPgw, PaymentPgwStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Interface de base pour les adaptateurs PGW
 */
export interface PaymentInitiateRequest {
  leaseId: string;
  mois: Date;
  montant: number;
  msisdnPayeur: string;
  payeurId: string;
  beneficiaireId: string;
  forceCanal?: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  status: PaymentPgwStatus;
  redirectUrl?: string;
  smsSent: boolean;
  expiresAt: Date;
}

export abstract class PgwAdapter {
  abstract initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
}
