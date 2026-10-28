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
 * Convert EUR to XOF (XOF) using the mandatory fixed rate.
 */
export function convertEurToXof(amountEur: number): number {
  return Math.round(amountEur * EXCHANGE_RATES.EUR_TO_XOF);
}

/**
 * Convert XOF (XOF) to EUR using the reverse fixed rate.
 */
export function convertXofToEur(amountXof: number): number {
  return Number((amountXof / EXCHANGE_RATES.EUR_TO_XOF).toFixed(2));
}

/**
 * Format any amount in XOF standard (e.g. "150 000 XOF")
 */
export function formatXOF(amount: number): string {
  return `${Math.round(amount || 0).toLocaleString('fr-FR')} XOF`;
}
