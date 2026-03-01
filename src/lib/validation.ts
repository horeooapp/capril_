/**
 * QAPRIL Financial Validation Logic
 * Applies legal limits for rent, deposit, and agency fees.
 */

export interface FinancialValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validateLeaseFinancials(data: {
    rentAmount: number;
    deposit?: number;
    advancePayment?: number;
    agencyFee?: number;
}): FinancialValidationResult {
    const errors: string[] = [];
    const monthlyRent = data.rentAmount;

    // 1. Caution (Deposit) <= 2 months rent
    if (data.deposit && data.deposit > monthlyRent * 2) {
        errors.push(`La caution (${data.deposit}) ne peut excéder 2 mois de loyer (${monthlyRent * 2}).`);
    }

    // 2. Avance (Advance) <= 2 months rent
    if (data.advancePayment && data.advancePayment > monthlyRent * 2) {
        errors.push(`L'avance sur loyer (${data.advancePayment}) ne peut excéder 2 mois de loyer (${monthlyRent * 2}).`);
    }

    // 3. Frais d'agence (Agency Fee) <= 1 month rent
    if (data.agencyFee && data.agencyFee > monthlyRent) {
        errors.push(`Les frais d'agence (${data.agencyFee}) ne peuvent excéder 1 mois de loyer (${monthlyRent}).`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
