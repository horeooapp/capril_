/**
 * Test de conformité S-07 — Calcul des échéances et retards
 * DoD Ticket S-07 : Valeurs exactes sur 3 cas (avant, jour J, après)
 */

import { calculerEcheanceBail } from '../echeance';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ ÉCHEC : ${message}`);
        process.exit(1);
    }
    console.log(`✅ SUCCÈS : ${message}`);
}

console.log('🧪 [TEST S-07] Lancement de la suite de tests pour le calcul d\'échéance...\n');

// =========================================================================
// CAS 1 : AVANT L'ÉCHÉANCE (jours_restants > 0, retard_jours == 0)
// =========================================================================
console.log('--- Test 1 : Avant l\'échéance ---');
{
    // Date de référence : 1er Novembre 2026
    // Jour limite de paiement : le 5 du mois
    // Mois non payé : 2026-11
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

// =========================================================================
// CAS 2 : JOUR J (jours_restants == 0, retard_jours == 0, est_jour_j == true)
// =========================================================================
console.log('\n--- Test 2 : Jour J (Jour limite exact) ---');
{
    // Date de référence : 5 Novembre 2026
    // Jour limite de paiement : le 5 du mois
    // Mois non payé : 2026-11
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

// =========================================================================
// CAS 3 : APRÈS L'ÉCHÉANCE (retard_jours > 0, jours_restants == 0, est_en_retard == true)
// =========================================================================
console.log('\n--- Test 3 : Après l\'échéance (Retard constaté) ---');
{
    // Date de référence : 12 Novembre 2026
    // Jour limite de paiement : le 5 du mois
    // Mois non payé : 2026-11
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

// =========================================================================
// CAS 4 : CAS MULTI-MOIS AVEC QUITTANCES DÉJÀ RÉGLÉES D'AVANCE
// =========================================================================
console.log('\n--- Test 4 : Paiements d\'avance (Novembre 2026 à Mars 2027 déjà payés) ---');
{
    // Date de référence : 12 Novembre 2026
    // Mois payés : 2026-11, 2026-12, 2027-01, 2027-02, 2027-03
    // Jour limite : le 5
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

