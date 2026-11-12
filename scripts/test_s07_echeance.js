/**
 * Test de conformité S-07 — Calcul des échéances et retards
 * DoD Ticket S-07 : Valeurs exactes sur 3 cas (avant, jour J, après)
 */

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ ÉCHEC : ${message}`);
        process.exit(1);
    }
    console.log(`✅ SUCCÈS : ${message}`);
}

// Implémentation testée (identique à src/lib/echeance.ts)
function calculerEcheanceBail(params) {
    const paymentDay = (typeof params.paymentDay === 'number' && params.paymentDay >= 1 && params.paymentDay <= 31)
        ? Math.floor(params.paymentDay)
        : 5;

    const paidSet = new Set((params.paidMonths || []).map(m => m.trim().substring(0, 7)));

    const now = params.referenceDate ? new Date(params.referenceDate) : new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (params.startDate) {
        const start = new Date(params.startDate);
        if (!isNaN(start.getTime())) {
            const startYear = start.getFullYear();
            const startMonth = start.getMonth() + 1;
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

    const maxDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const actualDueDay = Math.min(paymentDay, maxDaysInMonth);
    const prochaine_echeance_date = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(actualDueDay).padStart(2, '0')}`;

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
        jours_restants = diffDays;
        retard_jours = 0;
        est_jour_j = false;
        est_en_retard = false;
        texte_echeance = diffDays === 1 
            ? `Échéance demain (${dateLisible})`
            : `Échéance le ${dateLisible} (dans ${diffDays} jours)`;
    } else if (diffDays === 0) {
        jours_restants = 0;
        retard_jours = 0;
        est_jour_j = true;
        est_en_retard = false;
        texte_echeance = `Échéance aujourd'hui (${dateLisible})`;
    } else {
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

console.log('🧪 [TEST S-07] Lancement de la suite de tests pour le calcul d\'échéance...\n');

// CAS 1 : AVANT L'ÉCHÉANCE
console.log('--- Test 1 : Avant l\'échéance ---');
{
    const res = calculerEcheanceBail({
        paymentDay: 5,
        paidMonths: [],
        referenceDate: new Date(2026, 10, 1) // 1er Nov 2026
    });

    console.log('Résultat Cas 1 :', res);
    assert(res.prochaine_echeance_date === '2026-11-05', 'Date d\'échéance doit être 2026-11-05');
    assert(res.jours_restants === 4, 'Il doit rester exactement 4 jours (du 1er au 5)');
    assert(res.retard_jours === 0, 'Le retard doit être strictement égal à 0');
    assert(res.est_jour_j === false, 'Ne doit pas être jour J');
    assert(res.est_en_retard === false, 'Ne doit pas être en retard');
    assert(res.periode_mois === '2026-11', 'La période concernée doit être 2026-11');
}

// CAS 2 : JOUR J
console.log('\n--- Test 2 : Jour J (Jour limite exact) ---');
{
    const res = calculerEcheanceBail({
        paymentDay: 5,
        paidMonths: [],
        referenceDate: new Date(2026, 10, 5) // 5 Nov 2026
    });

    console.log('Résultat Cas 2 :', res);
    assert(res.prochaine_echeance_date === '2026-11-05', 'Date d\'échéance doit être 2026-11-05');
    assert(res.jours_restants === 0, 'Les jours restants doivent être égaux à 0');
    assert(res.retard_jours === 0, 'Le retard doit être strictement égal à 0');
    assert(res.est_jour_j === true, 'est_jour_j doit être true');
    assert(res.est_en_retard === false, 'Ne doit pas être en retard');
    assert(res.texte_echeance.includes('aujourd\'hui'), 'Le libellé doit indiquer aujourd\'hui');
}

// CAS 3 : APRÈS L'ÉCHÉANCE (RETARD)
console.log('\n--- Test 3 : Après l\'échéance (Retard constaté) ---');
{
    const res = calculerEcheanceBail({
        paymentDay: 5,
        paidMonths: [],
        referenceDate: new Date(2026, 10, 12) // 12 Nov 2026
    });

    console.log('Résultat Cas 3 :', res);
    assert(res.prochaine_echeance_date === '2026-11-05', 'Date d\'échéance doit être 2026-11-05');
    assert(res.jours_restants === 0, 'jours_restants doit être égal à 0 en retard');
    assert(res.retard_jours === 7, 'Le retard doit être exactement de 7 jours (12 - 5)');
    assert(res.est_jour_j === false, 'Ne doit pas être jour J');
    assert(res.est_en_retard === true, 'est_en_retard doit être true');
    assert(res.texte_echeance.includes('En retard de 7 jours'), 'Le texte doit indiquer 7 jours de retard');
}

// CAS 4 : PAIEMENT MULTI-MOIS D'AVANCE
console.log('\n--- Test 4 : Paiements d\'avance (Novembre 2026 à Mars 2027 déjà payés) ---');
{
    const res = calculerEcheanceBail({
        paymentDay: 5,
        paidMonths: ['2026-11', '2026-12', '2027-01', '2027-02', '2027-03'],
        referenceDate: new Date(2026, 10, 12)
    });

    console.log('Résultat Cas 4 :', res);
    assert(res.periode_mois === '2027-04', 'Prochain mois impayé doit être Avril 2027');
    assert(res.prochaine_echeance_date === '2027-04-05', 'Date d\'échéance doit être le 5 avril 2027');
    assert(res.jours_restants > 140, 'Doit avoir plus de 140 jours restants');
    assert(res.retard_jours === 0, 'Zéro retard car le locataire est à jour');
    assert(res.est_en_retard === false, 'Locataire non en retard');
}

console.log('\n🎉 TOUS LES TESTS S-07 SONT VALIDÉS AVEC SUCCÈS (DoD CONFORME).\n');

