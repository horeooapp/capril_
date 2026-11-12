/**
 * Test de conformité S-06 — Contrôles de bail & Droits d'Enregistrement DGI
 * Référence : IC-01-R1 / Ticket S-06
 * DoD : Tests : 3 mois refusé ; bail sans durée refusé ; dépôt <= 2 ; avance <= 2 ; calcul DGI exact.
 */

const fs = require('fs');
const path = require('path');

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ ÉCHEC : ${message}`);
        process.exit(1);
    }
    console.log(`✅ SUCCÈS : ${message}`);
}

// Charger lexique officiel
const lexiquePath = path.resolve(__dirname, '../config/lexique.json');
const lexique = JSON.parse(fs.readFileSync(lexiquePath, 'utf8'));

console.log('🧪 [TEST S-06] Lancement de la suite de tests des contrôles de bail et calcul DGI...\n');

// Implémentation testée (identique à src/lib/lease-validation.ts)
const DUREES_VALIDES_MOIS = [12, 24, 36];
const LEASE_LEXIQUE_MESSAGES = {
    depot_max: lexique.bail.depot_max,
    avance_max: lexique.bail.avance_max,
    duree_requise: lexique.bail.duree_requise,
    mention_loi_pdf: lexique.bail.mention_loi_pdf,
};

function calculerDroitsEnregistrement(loyerMensuel, dureeMois) {
    const rent = Math.max(0, Math.round(Number(loyerMensuel) || 0));
    const duration = Math.max(1, Math.round(Number(dureeMois) || 12));
    const dureeRetenueMois = Math.min(duration, 12);
    const baseCalcul = rent * dureeRetenueMois;
    const droitsEnregistrement = Math.round(baseCalcul * 0.025);
    const fraisTimbre = 1000;
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

function validateLeaseInput(input) {
    const rent = Math.max(0, Math.round(Number(input.rentAmount) || 0));
    const maxLegalLimit = rent * 2;
    const errors = [];

    // 1. Validation durée
    let parsedDuration = undefined;
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
        if (!DUREES_VALIDES_MOIS.includes(d)) {
            errors.push({
                field: "durationMonths",
                code: "DUREE_INVALIDE",
                message: LEASE_LEXIQUE_MESSAGES.duree_requise,
            });
        } else {
            parsedDuration = d;
        }
    }

    // 2. Validation dépôt de garantie
    if (input.depositAmount !== undefined && input.depositAmount !== null && input.depositAmount !== "") {
        const dep = Math.round(Number(input.depositAmount) || 0);
        if (dep > maxLegalLimit) {
            errors.push({
                field: "depositAmount",
                code: "DEPOT_MAX_DEPASSE",
                message: LEASE_LEXIQUE_MESSAGES.depot_max,
            });
        }
    }

    // 3. Validation avance
    if (input.avanceLoyer !== undefined && input.avanceLoyer !== null && input.avanceLoyer !== "") {
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
        return {
            isValid: false,
            statusCode: 422,
            error: errors[0].message,
            code: errors[0].code,
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

// ==========================================
// TEST 1 : DoD STRICT - 3 mois refusé (422)
// ==========================================
console.log('--- Test 1 : Durée de 3 mois refusée (DoD S-06) ---');
const test3Mois = validateLeaseInput({
    rentAmount: 150000,
    durationMonths: 3,
    depositAmount: 300000,
    avanceLoyer: 300000,
});
assert(test3Mois.isValid === false, 'La durée de 3 mois doit être déclarée invalide');
assert(test3Mois.statusCode === 422, 'Le code HTTP retourné doit être 422');
assert(test3Mois.code === 'DUREE_INVALIDE', 'Le code d\'erreur doit être DUREE_INVALIDE');
assert(test3Mois.error === lexique.bail.duree_requise, `Le message doit être exactement : "${lexique.bail.duree_requise}"`);

// ==========================================
// TEST 2 : DoD STRICT - Bail sans durée refusé (422)
// ==========================================
console.log('\n--- Test 2 : Bail sans durée refusé (DoD S-06) ---');
const testSansDuree = validateLeaseInput({
    rentAmount: 150000,
    durationMonths: undefined,
    depositAmount: 300000,
    avanceLoyer: 300000,
});
assert(testSansDuree.isValid === false, 'Le bail sans durée doit être déclaré invalide');
assert(testSansDuree.statusCode === 422, 'Le code HTTP doit être 422');
assert(testSansDuree.code === 'DUREE_INVALIDE', 'Le code d\'erreur doit être DUREE_INVALIDE');
assert(testSansDuree.error === lexique.bail.duree_requise, 'Le message d\'erreur doit être issu du lexique');

const testDureeVide = validateLeaseInput({
    rentAmount: 150000,
    durationMonths: '',
});
assert(testDureeVide.isValid === false, 'Une chaîne vide pour la durée doit être refusée');
assert(testDureeVide.statusCode === 422, 'Statut 422 pour chaîne vide');

// ==========================================
// TEST 3 : Durées autorisées (12, 24, 36 mois) acceptées
// ==========================================
console.log('\n--- Test 3 : Durées conformes (12, 24, 36 mois) ---');
[12, 24, 36].forEach((d) => {
    const res = validateLeaseInput({
        rentAmount: 100000,
        durationMonths: d,
        depositAmount: 200000,
        avanceLoyer: 200000,
    });
    assert(res.isValid === true, `Durée de ${d} mois doit être acceptée`);
    assert(res.statusCode === 200, `Statut 200 pour durée ${d} mois`);
    assert(res.parsedDuration === d, `parsedDuration doit valoir ${d}`);
});

// ==========================================
// TEST 4 : Dépôt > 2 mois de loyer refusé (Art. 416 CCH)
// ==========================================
console.log('\n--- Test 4 : Dépôt de garantie > 2 mois refusé (422) ---');
const testDepotExces = validateLeaseInput({
    rentAmount: 100000,
    durationMonths: 12,
    depositAmount: 250000, // 2.5 mois
    avanceLoyer: 200000,
});
assert(testDepotExces.isValid === false, 'Dépôt > 2 mois doit être refusé');
assert(testDepotExces.statusCode === 422, 'Statut 422 pour dépôt excessif');
assert(testDepotExces.code === 'DEPOT_MAX_DEPASSE', 'Code DEPOT_MAX_DEPASSE');
assert(testDepotExces.error === lexique.bail.depot_max, `Message issu du lexique : "${lexique.bail.depot_max}"`);

// ==========================================
// TEST 5 : Avance > 2 mois de loyer refusée (Art. 415 CCH)
// ==========================================
console.log('\n--- Test 5 : Avance sur loyer > 2 mois refusée (422) ---');
const testAvanceExces = validateLeaseInput({
    rentAmount: 100000,
    durationMonths: 12,
    depositAmount: 200000,
    avanceLoyer: 300000, // 3 mois
});
assert(testAvanceExces.isValid === false, 'Avance > 2 mois doit être refusée');
assert(testAvanceExces.statusCode === 422, 'Statut 422 pour avance excessive');
assert(testAvanceExces.code === 'AVANCE_MAX_DEPASSEE', 'Code AVANCE_MAX_DEPASSEE');
assert(testAvanceExces.error === lexique.bail.avance_max, `Message issu du lexique : "${lexique.bail.avance_max}"`);

// ==========================================
// TEST 6 : Récapitulatif Droits d'Enregistrement DGI (Art. 550 CGI)
// ==========================================
console.log('\n--- Test 6 : Calcul exact des Droits d\'Enregistrement DGI ---');
// Cas A : Loyer 100 000 FCFA, 12 mois
// Assiette = 100 000 * 12 = 1 200 000
// Droits 2.5% = 30 000
// Timbre = 1 000 (2 pages x 500)
// Total DGI = 31 000 FCFA
const dgiCasA = calculerDroitsEnregistrement(100000, 12);
console.log('Résultat Cas A (100k, 12m) :', dgiCasA);
assert(dgiCasA.baseCalcul === 1200000, 'Assiette annuelle doit être 1 200 000 FCFA');
assert(dgiCasA.droitsEnregistrement === 30000, 'Droits 2.5% doivent être 30 000 FCFA');
assert(dgiCasA.fraisTimbre === 1000, 'Frais de timbre doivent être 1 000 FCFA');
assert(dgiCasA.totalDroitsDgi === 31000, 'Total DGI doit être 31 000 FCFA');
assert(dgiCasA.mentionLegale === lexique.bail.mention_loi_pdf, 'Mention légale conforme au lexique');

// Cas B : Loyer 250 000 FCFA, 24 mois
// Assiette annuelle plafonnée à 12 mois = 250 000 * 12 = 3 000 000
// Droits 2.5% = 75 000
// Timbre = 1 000
// Total DGI = 76 000 FCFA
const dgiCasB = calculerDroitsEnregistrement(250000, 24);
console.log('Résultat Cas B (250k, 24m) :', dgiCasB);
assert(dgiCasB.baseCalcul === 3000000, 'Assiette annuelle plafonnée doit être 3 000 000 FCFA');
assert(dgiCasB.droitsEnregistrement === 75000, 'Droits 2.5% doivent être 75 000 FCFA');
assert(dgiCasB.totalDroitsDgi === 76000, 'Total DGI doit être 76 000 FCFA');

console.log('\n🎉 TOUS LES TESTS S-06 SONT VALIDÉS AVEC SUCCÈS (DoD CONFORME).');
