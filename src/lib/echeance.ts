import { prisma } from '@/lib/prisma';

export interface EcheanceCalculation {
    prochaine_echeance_date: string; // YYYY-MM-DD
    jours_restants: number;          // Nombre de jours restants jusqu'à l'échéance (0 si aujourd'hui ou dépassé)
    retard_jours: number;            // Nombre de jours de retard après l'échéance (0 si avant ou jour J)
    periode_mois: string;            // Mois concerné (YYYY-MM)
    est_jour_j: boolean;             // True si aujourd'hui est le jour limite exact
    est_en_retard: boolean;          // True si aujourd'hui dépasse le jour limite et période non réglée
    texte_echeance: string;          // Libellé en français respectant config/lexique.json
}

/**
 * Calcule l'échéance et le retard pour un bail selon les règles IC-01-R1 (Ticket S-07).
 * Conforme au DoD : valeurs exactes sur les 3 cas fondamentaux (avant, jour J, après).
 *
 * @param params.paymentDay Jour du mois fixé pour le paiement (1 à 31, défaut 5)
 * @param params.paidMonths Liste des mois déjà réglés sous format YYYY-MM (ex: ['2026-11'])
 * @param params.startDate Date de début du bail (optionnel)
 * @param params.referenceDate Date de référence pour le calcul (défaut: aujourd'hui)
 */
export function calculerEcheanceBail(params: {
    paymentDay?: number | null;
    paidMonths?: string[];
    startDate?: Date | string | null;
    referenceDate?: Date;
}): EcheanceCalculation {
    const paymentDay = (typeof params.paymentDay === 'number' && params.paymentDay >= 1 && params.paymentDay <= 31)
        ? Math.floor(params.paymentDay)
        : 5;

    const paidSet = new Set((params.paidMonths || []).map(m => m.trim().substring(0, 7)));

    const now = params.referenceDate ? new Date(params.referenceDate) : new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // 1. Déterminer la période d'échéance concernée (le plus ancien mois non réglé)
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (params.startDate) {
        const start = new Date(params.startDate);
        if (!isNaN(start.getTime())) {
            const startYear = start.getFullYear();
            const startMonth = start.getMonth() + 1;
            // Si le bail a commencé avant le mois en cours, chercher depuis le début du bail
            let y = startYear;
            let m = startMonth;
            while ((y < currentYear || (y === currentYear && m <= currentMonth))) {
                const key = `${y}-${String(m).padStart(2, '0')}`;
                if (!paidSet.has(key)) {
                    targetYear = y;
                    targetMonth = m;
                    break;
                }
                m++;
                if (m > 12) {
                    m = 1;
                    y++;
                }
            }
        }
    }

    // Si le mois cible est déjà payé (ex: loyer payé d'avance), avancer au premier mois futur impayé
    let searchY = targetYear;
    let searchM = targetMonth;
    let forwardCount = 0;
    while (paidSet.has(`${searchY}-${String(searchM).padStart(2, '0')}`) && forwardCount < 36) {
        forwardCount++;
        searchM++;
        if (searchM > 12) {
            searchM = 1;
            searchY++;
        }
    }
    targetYear = searchY;
    targetMonth = searchM;

    const periode_mois = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    // 2. Construire la date d'échéance (jour limite du mois cible)
    const maxDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const actualDueDay = Math.min(paymentDay, maxDaysInMonth);
    const prochaine_echeance_date = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(actualDueDay).padStart(2, '0')}`;

    // 3. Calcul calendaire en jours entiers (sans dérive horaire UTC)
    const refDateOnly = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dueDateOnly = new Date(Date.UTC(targetYear, targetMonth - 1, actualDueDay));

    const diffMs = dueDateOnly.getTime() - refDateOnly.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let jours_restants = 0;
    let retard_jours = 0;
    let est_jour_j = false;
    let est_en_retard = false;
    let texte_echeance = '';

    const monthsFr = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const dateLisible = `${actualDueDay} ${monthsFr[targetMonth - 1]} ${targetYear}`;

    if (diffDays > 0) {
        // CAS 1 : Avant l'échéance
        jours_restants = diffDays;
        retard_jours = 0;
        est_jour_j = false;
        est_en_retard = false;
        texte_echeance = diffDays === 1 
            ? `Échéance demain (${dateLisible})`
            : `Échéance le ${dateLisible} (dans ${diffDays} jours)`;
    } else if (diffDays === 0) {
        // CAS 2 : Jour J
        jours_restants = 0;
        retard_jours = 0;
        est_jour_j = true;
        est_en_retard = false;
        texte_echeance = `Échéance aujourd'hui (${dateLisible})`;
    } else {
        // CAS 3 : Après l'échéance (Retard)
        jours_restants = 0;
        retard_jours = Math.abs(diffDays);
        est_jour_j = false;
        est_en_retard = true;
        texte_echeance = retard_jours === 1
            ? `En retard de 1 jour (échéance le ${dateLisible})`
            : `En retard de ${retard_jours} jours (échéance le ${dateLisible})`;
    }

    return {
        prochaine_echeance_date,
        jours_restants,
        retard_jours,
        periode_mois,
        est_jour_j,
        est_en_retard,
        texte_echeance
    };
}

/**
 * Récupère un bail en base de données et calcule ses échéances certifiées.
 */
export async function getEcheanceBail(leaseId: string, referenceDate?: Date): Promise<EcheanceCalculation | null> {
    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        select: {
            id: true,
            paymentDay: true,
            startDate: true,
            receipts: {
                where: { status: { in: ['PAID', 'paid'] } },
                select: { periodMonth: true }
            }
        }
    });

    if (!lease) return null;

    const paidMonths = lease.receipts.map(r => r.periodMonth);
    return calculerEcheanceBail({
        paymentDay: lease.paymentDay,
        paidMonths,
        startDate: lease.startDate,
        referenceDate
    });
}

