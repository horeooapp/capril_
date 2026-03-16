/**
 * M17 — Module d'Enregistrement Fiscal des Baux
 * Fondement légal : Article 550 alinéa 1 CGI Côte d'Ivoire
 */

export const FISCAL_TAX_RATE = 0.025; // 2.5%
export const STAMP_DUTY_PER_PAGE = 500;
export const DEFAULT_PAGES_COUNT = 2;
export const PENALTY_MONTHLY_RATE = 0.10; // 10% amende de retard (estimation standard)

export interface FiscalCalculation {
    loyerMensuel: number;
    dureeBailMois: number;
    dureeRetenueMois: number;
    baseCalcul: number;
    droitsEnregistrement: number;
    fraisTimbre: number;
    fraisQapril: number;
    penaltyAmount: number;
    totalDgi: number;
    totalBailleur: number;
    isLate: boolean;
    daysLate: number;
}

/**
 * Calcule les droits DGI selon l'Art. 550 CGI CI
 */
export function calculateFiscalDroits(
    loyerMensuel: number, 
    dureeBailMois: number, 
    dateSignature: Date,
    leaseType: 'residential' | 'commercial' = 'residential'
): FiscalCalculation {
    const now = new Date();
    const limitDate = new Date(dateSignature);
    limitDate.setDate(limitDate.getDate() + 30);

    const isLate = now > limitDate;
    const daysLate = isLate ? Math.floor((now.getTime() - limitDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Plafonnement à 12 mois pour les baux à durée indéterminée (DI) 
    // ou baux longs pour la base de calcul fiscale initiale
    const dureeRetenue = Math.min(dureeBailMois, 12);
    const baseCalcul = loyerMensuel * dureeRetenue;

    const droits = Math.round(baseCalcul * FISCAL_TAX_RATE);
    const timbres = DEFAULT_PAGES_COUNT * STAMP_DUTY_PER_PAGE;

    // Pénalités de retard (10% si > 30 jours)
    const penalty = isLate ? Math.round(droits * 0.10) : 0;

    // Frais QAPRIL (Moteur de service)
    let fraisQapril = 4000;
    if (leaseType === 'commercial') {
        fraisQapril = 5000;
    } else if (loyerMensuel < 100000) {
        fraisQapril = 3000;
    }

    const totalDgi = droits + timbres + penalty;
    const totalBailleur = totalDgi + fraisQapril;

    return {
        loyerMensuel,
        dureeBailMois,
        dureeRetenueMois: dureeRetenue,
        baseCalcul,
        droitsEnregistrement: droits,
        fraisTimbre: timbres,
        fraisQapril,
        penaltyAmount: penalty,
        totalDgi,
        totalBailleur,
        isLate,
        daysLate
    };
}
