/**
 * CURRENCY UTILITIES - QAPRIL Rulebook v1.0
 * BCEAO Standard Exchange Rates
 */

export const EXCHANGE_RATES = {
  /**
   * Taux Diaspora (EURO/FCFA) : Fixé à 655,957 (standard BCEAO).
   * Rulebook: Phase 1 Diaspora Package
   */
  EUR_TO_XOF: 655.957,
};

/**
 * Convert EUR to FCFA (XOF) using the mandatory fixed rate.
 */
export function convertEurToXof(amountEur: number): number {
  return Math.round(amountEur * EXCHANGE_RATES.EUR_TO_XOF);
}

/**
 * Convert FCFA (XOF) to EUR using the reverse fixed rate.
 */
export function convertXofToEur(amountXof: number): number {
  return Number((amountXof / EXCHANGE_RATES.EUR_TO_XOF).toFixed(2));
}
