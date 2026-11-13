/**
 * S-06 — Contrôles de bail & Récapitulatif des Droits d'Enregistrement DGI
 *
 * Référence légale :
 * - Loi n° 2019-576 du 26 juin 2019 (Code de la Construction et de l'Habitat) :
 *   - Art. 415 CCH : Avance sur loyer plafonnée à 2 mois maximum.
 *   - Art. 416 CCH : Dépôt de garantie plafonné à 2 mois maximum.
 * - Article 550 CGI Côte d'Ivoire :
 *   - Droits d'enregistrement : 2,5 % de l'assiette locative annuelle.
 *   - Frais de timbre fiscal : 1 000 FCFA (2 pages à 500 FCFA).
 *
 * Messages issus de config/lexique.json (bail.duree_requise, bail.depot_max, bail.avance_max)
 */

import lexique from "../../config/lexique.json";

export const DUREES_VALIDES_MOIS = [12, 24, 36] as const;
export type DureeValideMois = (typeof DUREES_VALIDES_MOIS)[number];

export const LEASE_LEXIQUE_MESSAGES = {
    depot_max: lexique.bail.depot_max, // "Le dépôt de garantie ne peut pas dépasser 2 mois de loyer."
    avance_max: lexique.bail.avance_max, // "L'avance exigée ne peut pas dépasser 2 mois de loyer."
    duree_requise: lexique.bail.duree_requise, // "Indiquez la durée du bail : 12, 24 ou 36 mois."
    mention_loi_pdf: lexique.bail.mention_loi_pdf, // "Bail soumis à la loi n° 2019-576 relative au bail à usage d'habitation."
};

export interface DroitsEnregistrementResult {
    loyerMensuel: number;
    dureeMois: number;
    dureeRetenueMois: number;
    baseCalcul: number;
    taux: number; // 0.025 (2.5%)
    droitsEnregistrement: number;
    fraisTimbre: number; // 1 000 FCFA
    totalDroitsDgi: number;
    mentionLegale: string;
}

/**
 * Calcule le récapitulatif officiel des droits d'enregistrement DGI selon l'Art. 550 CGI Côte d'Ivoire
 */
export function calculerDroitsEnregistrement(
    loyerMensuel: number,
    dureeMois: number
): DroitsEnregistrementResult {
    const rent = Math.max(0, Math.round(Number(loyerMensuel) || 0));
    const duration = Math.max(1, Math.round(Number(dureeMois) || 12));

    // Assiette annuelle DGI (Art. 550 CGI : 1 an de loyer pour un bail à durée déterminée standard)
    const dureeRetenueMois = Math.min(duration, 12);
    const baseCalcul = rent * dureeRetenueMois;
    const droitsEnregistrement = Math.round(baseCalcul * 0.025);
    const fraisTimbre = 1000; // 2 pages x 500 F
    const totalDroitsDgi = droitsEnregistrement + fraisTimbre;

    return {
        loyerMensuel: rent,
        dureeMois: duration,
        dureeRetenueMois,
        baseCalcul,
        taux: 0.025,
        droitsEnregistrement,
        fraisTimbre,
        totalDroitsDgi,
        mentionLegale: LEASE_LEXIQUE_MESSAGES.mention_loi_pdf,
    };
}

export interface LeaseValidationInput {
    rentAmount: number;
    depositAmount?: number | null;
    avanceLoyer?: number | null;
    durationMonths?: number | string | null;
}

export interface LeaseValidationError {
    field: "durationMonths" | "depositAmount" | "avanceLoyer";
    code: "DUREE_INVALIDE" | "DEPOT_MAX_DEPASSE" | "AVANCE_MAX_DEPASSEE";
    message: string;
}

export interface LeaseValidationResult {
    isValid: boolean;
    statusCode: 200 | 422;
    error?: string;
    code?: string;
    errors: LeaseValidationError[];
    parsedDuration?: DureeValideMois;
    maxLegalDeposit: number;
    maxLegalAdvance: number;
    recapitulatifDroitsEnregistrement?: DroitsEnregistrementResult;
}

/**
 * Valide les plafonnements légaux et la durée obligatoire du bail selon S-06
 * Renvoie un résultat avec code HTTP 422 et messages conformes à config/lexique.json en cas d'infraction.
 */
export function validateLeaseInput(input: LeaseValidationInput): LeaseValidationResult {
    const rent = Math.max(0, Math.round(Number(input.rentAmount) || 0));
    const maxLegalLimit = rent * 2;
    const errors: LeaseValidationError[] = [];

    // 1. Validation de la durée obligatoire : 12, 24 ou 36 mois
    let parsedDuration: DureeValideMois | undefined = undefined;
    if (
        input.durationMonths === undefined ||
        input.durationMonths === null ||
        input.durationMonths === "" ||
        isNaN(Number(input.durationMonths))
    ) {
        errors.push({
            field: "durationMonths",
            code: "DUREE_INVALIDE",
            message: LEASE_LEXIQUE_MESSAGES.duree_requise,
        });
    } else {
        const d = Number(input.durationMonths);
        if (!DUREES_VALIDES_MOIS.includes(d as any)) {
            errors.push({
                field: "durationMonths",
                code: "DUREE_INVALIDE",
                message: LEASE_LEXIQUE_MESSAGES.duree_requise,
            });
        } else {
            parsedDuration = d as DureeValideMois;
        }
    }

    // 2. Validation du dépôt de garantie (caution <= 2 mois)
    if (input.depositAmount !== undefined && input.depositAmount !== null && input.depositAmount !== ('' as any)) {
        const dep = Math.round(Number(input.depositAmount) || 0);
        if (dep > maxLegalLimit) {
            errors.push({
                field: "depositAmount",
                code: "DEPOT_MAX_DEPASSE",
                message: LEASE_LEXIQUE_MESSAGES.depot_max,
            });
        }
    }

    // 3. Validation de l'avance sur loyer (avance <= 2 mois)
    if (input.avanceLoyer !== undefined && input.avanceLoyer !== null && input.avanceLoyer !== ('' as any)) {
        const av = Math.round(Number(input.avanceLoyer) || 0);
        if (av > maxLegalLimit) {
            errors.push({
                field: "avanceLoyer",
                code: "AVANCE_MAX_DEPASSEE",
                message: LEASE_LEXIQUE_MESSAGES.avance_max,
            });
        }
    }

    if (errors.length > 0) {
        const primaryError = errors[0];
        return {
            isValid: false,
            statusCode: 422,
            error: primaryError.message,
            code: primaryError.code,
            errors,
            maxLegalDeposit: maxLegalLimit,
            maxLegalAdvance: maxLegalLimit,
        };
    }

    const durationForDgi = parsedDuration || 12;
    const recapitulatifDroitsEnregistrement = calculerDroitsEnregistrement(rent, durationForDgi);

    return {
        isValid: true,
        statusCode: 200,
        errors: [],
        parsedDuration,
        maxLegalDeposit: maxLegalLimit,
        maxLegalAdvance: maxLegalLimit,
        recapitulatifDroitsEnregistrement,
    };
}

