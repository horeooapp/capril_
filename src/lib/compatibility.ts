/**
 * S-13 : Moteur de calcul du score de compatibilité (IC-01-R1)
 *
 * Pondération :
 * - Budget (40 %) : loyer mensuel vs budget max locataire
 * - Localisation (30 %) : commune / quartier
 * - Typologie (20 %) : type de logement & pièces
 * - Date au plus tard (10 %) : disponibilité du bien vs date souhaitée locataire
 *
 * Retourne le score (0-100), ainsi que les raisons (atouts) et manques (points d'écart).
 */

export interface CompatibilityInput {
    // Annonce / Logement
    loyer: number;
    commune: string;
    quartier?: string | null;
    propertyType?: string | null;
    rooms?: number | null;
    disponibleLe?: Date | string | null;

    // Profil de recherche locataire
    budgetMax?: number | null;
    communesSouhaitees?: string[] | null;
    typesSouhaites?: string[] | null;
    dateSouhaitee?: Date | string | null;
    piecesSouhaitees?: number | null;
}

export interface CompatibilityResult {
    score: number; // 0 à 100
    scorePct: string; // ex: "92%"
    raisons: string[]; // Points forts
    manques: string[]; // Critères non atteints
}

export function calculerScoreCompatibilite(input: CompatibilityInput): CompatibilityResult {
    let scoreTotal = 0;
    const raisons: string[] = [];
    const manques: string[] = [];

    // 1. BUDGET (40 points max)
    if (input.budgetMax && input.budgetMax > 0) {
        if (input.loyer <= input.budgetMax) {
            scoreTotal += 40;
            const diff = input.budgetMax - input.loyer;
            if (diff >= 20000) {
                raisons.push(`Loyer inférieur de ${diff.toLocaleString('fr-FR')} F à votre budget max`);
            } else {
                raisons.push('Loyer conforme à votre budget maximum');
            }
        } else {
            const depassementPct = (input.loyer - input.budgetMax) / input.budgetMax;
            if (depassementPct <= 0.10) {
                scoreTotal += 25; // léger dépassement (<= 10%)
                manques.push(`Loyer légèrement supérieur (+${Math.round(depassementPct * 100)} %) à votre budget`);
            } else if (depassementPct <= 0.25) {
                scoreTotal += 10;
                manques.push(`Loyer supérieur de ${(input.loyer - input.budgetMax).toLocaleString('fr-FR')} F à votre budget`);
            } else {
                manques.push(`Loyer hors budget (+${(input.loyer - input.budgetMax).toLocaleString('fr-FR')} F)`);
            }
        }
    } else {
        scoreTotal += 30; // budget non spécifié
    }

    // 2. LOCALISATION (30 points max)
    if (input.communesSouhaitees && input.communesSouhaitees.length > 0) {
        const matchCommune = input.communesSouhaitees.some(
            c => c.toLowerCase().trim() === input.commune.toLowerCase().trim() || c.toUpperCase() === 'TOUTES'
        );
        if (matchCommune) {
            scoreTotal += 30;
            raisons.push(`Situé dans votre commune cible (${input.commune})`);
        } else {
            manques.push(`Situé à ${input.commune} (hors communes ciblées : ${input.communesSouhaitees.join(', ')})`);
        }
    } else {
        scoreTotal += 20; // pas de commune spécifique demandée
    }

    // 3. TYPOLOGIE & PIÈCES (20 points max)
    let typeMatched = true;
    if (input.typesSouhaites && input.typesSouhaites.length > 0 && input.propertyType) {
        typeMatched = input.typesSouhaites.some(
            t => t.toLowerCase() === input.propertyType?.toLowerCase() || t.toUpperCase() === 'TOUS'
        );
    }
    if (typeMatched) {
        scoreTotal += 15;
        raisons.push('Type de bien correspondant à vos souhaits');
    } else {
        manques.push(`Type ${input.propertyType} différent de vos critères`);
    }

    if (input.piecesSouhaitees && input.rooms) {
        if (input.rooms >= input.piecesSouhaitees) {
            scoreTotal += 5;
            raisons.push(`${input.rooms} pièce(s) (au moins ${input.piecesSouhaitees} souhaitée(s))`);
        } else {
            manques.push(`${input.rooms} pièce(s) proposée(s) vs ${input.piecesSouhaitees} souhaitée(s)`);
        }
    } else {
        scoreTotal += 5;
    }

    // 4. DATE AU PLUS TARD (10 points max — S-13)
    if (input.dateSouhaitee) {
        const targetDate = new Date(input.dateSouhaitee);
        const availDate = input.disponibleLe ? new Date(input.disponibleLe) : new Date();

        if (availDate <= targetDate) {
            scoreTotal += 10;
            raisons.push(`Disponible dès le ${availDate.toLocaleDateString('fr-FR')} (avant votre date limite)`);
        } else {
            const diffDays = Math.ceil((availDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays <= 15) {
                scoreTotal += 5;
                manques.push(`Disponible ${diffDays} jour(s) après votre date souhaitée`);
            } else {
                manques.push(`Disponible à partir du ${availDate.toLocaleDateString('fr-FR')} (${diffDays} j de décalage)`);
            }
        }
    } else {
        scoreTotal += 10; // pas de contrainte de date
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(scoreTotal)));

    return {
        score: finalScore,
        scorePct: `${finalScore}%`,
        raisons,
        manques,
    };
}

