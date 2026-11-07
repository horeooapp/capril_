/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 : Canal conversationnel — mode sans application (SMS, WhatsApp, USSD)
 * Types et interfaces normatifs — Règles RG-CNV-01 à RG-CNV-30
 */

export type CnvTransportType = 'SMS' | 'WHATSAPP' | 'USSD';

export type CnvSensType = 'IN' | 'OUT';

export type CnvIntentionType =
  | 'CONFIRM_YES'
  | 'CONFIRM_NO'
  | 'ASK_QUIT'
  | 'ASK_ATTEST'
  | 'SIGNAL'
  | 'RELANCE'
  | 'PLAN'
  | 'CONGE'
  | 'PIN_INPUT'
  | 'STOP'
  | 'STOP_SAUF_BAIL'
  | 'CANAL'
  | 'AIDE'
  | 'ID_PHOTO'
  | 'BAIL_CREATE'
  | 'DGI_REGISTER'
  | 'INCONNU';

export interface ParsedIntent {
  intention: CnvIntentionType;
  codeBail?: string;
  mois?: string;
  pin?: string;
  nouveauCanal?: CnvTransportType;
  rawText: string;
}

export interface ConversationalContext {
  numero: string; // E.164 (+225...)
  transport: CnvTransportType;
  contactId?: string;
  compteId?: string | null;
  niveau: number; // 0: Répondant, 1: Identifié, 2: Contractant, 3: Application
  statutStop: boolean;
  stopSaufBail: boolean;
  activeConversationId?: string;
}

export interface ProcessMessageResult {
  success: boolean;
  reponseTexte: string;
  intentionDetectee: CnvIntentionType;
  transportUtilise: CnvTransportType;
  quittanceGenereeId?: string;
  quittancePdfUrl?: string;
  requiresPin?: boolean;
  compteCreeImplicitement?: boolean;
  sha256Empreinte: string;
  error?: string;
}

