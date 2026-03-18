import { PaymentCanal } from "@prisma/client";

/**
 * M-PGW Router
 * Gère la détection automatique du canal de paiement à partir du MSISDN (numéro de téléphone).
 */

export const MSISDN_PREFIX_MAP: Record<string, PaymentCanal> = {
  // Orange CI : 05, 07 (certains)
  "0500": "ORANGE", "0501": "ORANGE", "0502": "ORANGE", "0503": "ORANGE",
  "0504": "ORANGE", "0505": "ORANGE", "0506": "ORANGE", "0507": "ORANGE",
  "0700": "ORANGE", "0701": "ORANGE", "0702": "ORANGE", "0703": "ORANGE",
  "0707": "ORANGE", "0708": "ORANGE", "0709": "ORANGE",
  
  // MTN CI : 05 (certains), 06
  "0600": "MTN", "0601": "MTN", "0602": "MTN", "0603": "MTN", "0604": "MTN",
  "0605": "MTN", "0606": "MTN", "0607": "MTN", "0608": "MTN", "0609": "MTN",
  "0544": "MTN", "0545": "MTN", "0546": "MTN", "0554": "MTN", "0555": "MTN",
  
  // Wave CI : 01
  "0100": "WAVE", "0101": "WAVE", "0102": "WAVE", "0103": "WAVE", "0104": "WAVE",
  
  // Moov CI : 01 (certains), 07 (certains)
  "0105": "MOOV", "0106": "MOOV", "0107": "MOOV", "0147": "MOOV", "0148": "MOOV",
  "0704": "MOOV", "0705": "MOOV", "0706": "MOOV", "0747": "MOOV", "0748": "MOOV",
};

/**
 * Détecte l'opérateur (Canal) à partir d'un numéro de téléphone.
 * Supporte les formats : 0701020304, 2250701020304, +2250701020304
 */
export function detectPaymentCanal(msisdn: string): PaymentCanal | null {
  // Nettoyer le numéro (garder les 10 derniers chiffres pour la CI)
  const cleanMsisdn = msisdn.replace(/[\s\-\+]/g, "");
  const normalized = cleanMsisdn.length > 10 ? cleanMsisdn.slice(-10) : cleanMsisdn;

  if (normalized.length !== 10) return null;

  // Extraire le préfixe (4 premiers chiffres : ex '0701')
  const prefix4 = normalized.slice(0, 4);
  if (MSISDN_PREFIX_MAP[prefix4]) {
    return MSISDN_PREFIX_MAP[prefix4];
  }

  // Fallback sur 2 chiffres si nécessaire (ex '01', '05')
  const prefix2 = normalized.slice(0, 2);
  if (prefix2 === "01") return "WAVE"; // Par défaut 01 est Wave, sauf exceptions Moov
  if (prefix2 === "05") return "ORANGE"; // Par défaut 05 est Orange
  if (prefix2 === "06") return "MTN";
  if (prefix2 === "07") return "ORANGE";

  return null;
}
