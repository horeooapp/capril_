import { PaymentCanal } from "@prisma/client";

/**
 * M-PGW Router
 * Gère la détection automatique du canal de paiement à partir du MSISDN (numéro de téléphone).
 */

export const MSISDN_PREFIX_MAP: Record<string, PaymentCanal> = {
  // Orange CI : 05, 07 (certains)
  "0500": PaymentCanal.ORANGE, "0501": PaymentCanal.ORANGE, "0502": PaymentCanal.ORANGE, "0503": PaymentCanal.ORANGE,
  "0504": PaymentCanal.ORANGE, "0505": PaymentCanal.ORANGE, "0506": PaymentCanal.ORANGE, "0507": PaymentCanal.ORANGE,
  "0700": PaymentCanal.ORANGE, "0701": PaymentCanal.ORANGE, "0702": PaymentCanal.ORANGE, "0703": PaymentCanal.ORANGE,
  "0707": PaymentCanal.ORANGE, "0708": PaymentCanal.ORANGE, "0709": PaymentCanal.ORANGE,
  
  // MTN CI : 05 (certains), 06
  "0600": PaymentCanal.MTN, "0601": PaymentCanal.MTN, "0602": PaymentCanal.MTN, "0603": PaymentCanal.MTN, "0604": PaymentCanal.MTN,
  "0605": PaymentCanal.MTN, "0606": PaymentCanal.MTN, "0607": PaymentCanal.MTN, "0608": PaymentCanal.MTN, "0609": PaymentCanal.MTN,
  "0544": PaymentCanal.MTN, "0545": PaymentCanal.MTN, "0546": PaymentCanal.MTN, "0554": PaymentCanal.MTN, "0555": PaymentCanal.MTN,
  
  // Wave CI : 01
  "0100": PaymentCanal.WAVE, "0101": PaymentCanal.WAVE, "0102": PaymentCanal.WAVE, "0103": PaymentCanal.WAVE, "0104": PaymentCanal.WAVE,
  
  // Moov CI : 01 (certains), 07 (certains)
  "0105": PaymentCanal.MOOV, "0106": PaymentCanal.MOOV, "0107": PaymentCanal.MOOV, "0147": PaymentCanal.MOOV, "0148": PaymentCanal.MOOV,
  "0704": PaymentCanal.MOOV, "0705": PaymentCanal.MOOV, "0706": PaymentCanal.MOOV, "0747": PaymentCanal.MOOV, "0748": PaymentCanal.MOOV,
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
  if (prefix2 === "01") return PaymentCanal.WAVE; // Par défaut 01 est Wave, sauf exceptions Moov
  if (prefix2 === "05") return PaymentCanal.ORANGE; // Par défaut 05 est Orange
  if (prefix2 === "06") return PaymentCanal.MTN;
  if (prefix2 === "07") return PaymentCanal.ORANGE;

  return null;
}
