// QAPRIL — Types TypeScript générés depuis schema.prisma
// Réf: schema.prisma reçu le 01/04/2026

export type QaprilRole =
  "SUPER_ADMIN" | "ADMIN" | "LANDLORD" | "LANDLORD_PRO"
  | "AGENCY" | "TENANT" | "NON_CERTIFIED_AGENT";

export type LeaseStatus =
  "DRAFT" | "PENDING_SIGNATURE" | "PENDING_CONFIRMATION"
  | "ACTIVE" | "ACTIVE_DECLARATIF" | "LOYER_IMPAYE"
  | "TERMINATED" | "CANCELLED" | "ARCHIVED";

export type ReceiptStatus = "pending" | "paid" | "cancelled" | "disputed";

export type MandateStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED" | "DRAFT";

export type PaymentCanal =
  "ORANGE" | "MTN" | "WAVE" | "MOOV" | "CINETPAY_M17";

export type UtilityStatus =
  "EN_COURS" | "PAYEE" | "EN_RETARD" | "PARTIELLE" | "EN_ATTENTE";

export type UtilityType = "CIE" | "SODECI";

export type DeclencheurWallet =
  "SOLDE_BAS" | "FIN_DE_MOIS" | "CREDIT_GENERE" | "RAPPEL_MENSUEL" | "MANUEL";

export type TicketUrgence = "URGENTE" | "NORMALE" | "BASSE";

// Montant suggéré wallet
export type WalletMontantOption = "MINIMUM" | "RECOMMANDE" | "CONFORT";

export interface DashboardBailleur {
  walletBalance: number;
  walletSeuilAlerte: number;
  biensActifs: number;
  biensVacants: number;
  loyersMensuels: number;
  tauxRecouvrement: number;
  quittancesGenerees: number;
  alertes: AlerteDashboard[];
  biens: BienResume[];
}

export interface AlerteDashboard {
  type: "WALLET" | "IMPAYE" | "VACANT" | "EXPIRATION_BAIL";
  message: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface BienResume {
  id: string;
  propertyCode: string;
  commune: string;
  address: string;
  status: string;
  rentAmount: number;
  tenantName?: string;
  leaseStatus?: LeaseStatus;
  leaseReference?: string;
}

export interface DeepLinkWallet {
  operateur: PaymentCanal;
  montant: number;
  url: string;
  message: string;
}
