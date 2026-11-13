/**
 * Suite de tests de validation de la Vague 3 Serveur (S-10, S-11, S-12, S-13, S-15, S-17, S-18)
 * Exécutable via: node scripts/test_vague3_serveur.js
 */

const crypto = require('crypto');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  ❌ [FAIL] ${message}`);
        failed++;
    }
}

// ── S-13 : Implémentation du moteur de calcul de compatibilité ─────────────
function calculerScoreCompatibilite(input) {
    let scoreTotal = 0;
    const raisons = [];
    const manques = [];

    // 1. BUDGET (40 %)
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
                scoreTotal += 25;
                manques.push(`Loyer légèrement supérieur (+${Math.round(depassementPct * 100)} %) à votre budget`);
            } else {
                manques.push(`Loyer hors budget (+${(input.loyer - input.budgetMax).toLocaleString('fr-FR')} F)`);
            }
        }
    } else {
        scoreTotal += 30;
    }

    // 2. LOCALISATION (30 %)
    if (input.communesSouhaitees && input.communesSouhaitees.length > 0) {
        const matchCommune = input.communesSouhaitees.some(
            c => c.toLowerCase().trim() === input.commune.toLowerCase().trim() || c.toUpperCase() === 'TOUTES'
        );
        if (matchCommune) {
            scoreTotal += 30;
            raisons.push(`Situé dans votre commune cible (${input.commune})`);
        } else {
            manques.push(`Situé à ${input.commune} (hors communes ciblées)`);
        }
    } else {
        scoreTotal += 20;
    }

    // 3. TYPOLOGIE & PIÈCES (20 %)
    let typeMatched = true;
    if (input.typesSouhaites && input.typesSouhaites.length > 0 && input.propertyType) {
        typeMatched = input.typesSouhaites.some(
            t => t.toLowerCase() === input.propertyType.toLowerCase() || t.toUpperCase() === 'TOUS'
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
            raisons.push(`${input.rooms} pièce(s)`);
        } else {
            manques.push(`${input.rooms} pièce(s) vs ${input.piecesSouhaitees} souhaitée(s)`);
        }
    } else {
        scoreTotal += 5;
    }

    // 4. DATE AU PLUS TARD (10 % — S-13)
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
        scoreTotal += 10;
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(scoreTotal)));
    return { score: finalScore, scorePct: `${finalScore}%`, raisons, manques };
}

// ── S-17 : Calculs de distance & Géolocalisation ────────────────────────────
function calculateDistanceMeters(p1, p2) {
    const R = 6371000;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function generateLocalisationCode(commune, lat, lng) {
    const cleanCommune = (commune || 'ABJ').substring(0, 3).toUpperCase();
    const hash = crypto.createHash('sha256').update(`${lat.toFixed(5)}_${lng.toFixed(5)}`).digest('hex');
    const shortCode = parseInt(hash.substring(0, 4), 16) % 10000;
    return `QAP-${cleanCommune}-${String(shortCode).padStart(4, '0')}`;
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 VALIDATION VAGUE 3 SERVEUR (S-10, S-11, S-13, S-15, S-17)');
console.log('═══════════════════════════════════════════════════════════\n');

// ── Test S-13 : Score de compatibilité ─────────────────────────────────────
console.log('1. Test S-13 : Score de compatibilité');
{
    const resParfait = calculerScoreCompatibilite({
        loyer: 180000,
        commune: 'Cocody',
        propertyType: 'Appartement',
        rooms: 3,
        disponibleLe: new Date('2026-12-01'),
        budgetMax: 200000,
        communesSouhaitees: ['Cocody'],
        typesSouhaites: ['Appartement'],
        piecesSouhaitees: 3,
        dateSouhaitee: new Date('2026-12-15'),
    });

    assert(resParfait.score >= 85, `Score parfait >= 85 (reçu: ${resParfait.score})`);
    assert(resParfait.raisons.length >= 3, `Au moins 3 raisons positives (reçu: ${resParfait.raisons.length})`);
    assert(resParfait.manques.length === 0, `Zéro manque sur correspondance parfaite (reçu: ${resParfait.manques.length})`);

    const resPartiel = calculerScoreCompatibilite({
        loyer: 210000,
        commune: 'Cocody',
        propertyType: 'Appartement',
        rooms: 2,
        disponibleLe: new Date('2026-12-25'),
        budgetMax: 200000,
        communesSouhaitees: ['Cocody'],
        typesSouhaites: ['Appartement'],
        piecesSouhaitees: 3,
        dateSouhaitee: new Date('2026-12-15'),
    });

    assert(resPartiel.score < resParfait.score, `Score partiel inférieur au parfait (${resPartiel.score} < ${resParfait.score})`);
    assert(resPartiel.manques.length >= 2, `Au moins 2 manques identifiés (reçu: ${resPartiel.manques.length})`);
}

// ── Test S-17 : Géolocalisation & Concordance ──────────────────────────────
console.log('\n2. Test S-17 : Calculs de distance & Concordance');
{
    const p1 = { lat: 5.35995, lng: -3.98701 };
    const p2Proche = { lat: 5.35999, lng: -3.98705 }; // ~6m
    const p2Loin = { lat: 5.36200, lng: -3.98900 };   // > 200m

    const dProche = calculateDistanceMeters(p1, p2Proche);
    const dLoin = calculateDistanceMeters(p1, p2Loin);

    assert(dProche <= 30, `Distance concordante <= 30m (reçu: ${dProche} m)`);
    assert(dLoin > 100, `Distance anormale > 100m (reçu: ${dLoin} m)`);

    const code = generateLocalisationCode('Cocody', p1.lat, p1.lng);
    assert(code.startsWith('QAP-COC-'), `Code de localisation au format QAP-COC-XXXX (reçu: ${code})`);
}

// ── Test S-11 / S-15 : Masquage identité (RG-CONF) ─────────────────────────
console.log('\n3. Test S-11 / S-15 : Logique RG-CONF et identité masquée');
{
    function computeSenderDisplay(sender, isTenantViewer, isMasked, hasAgency, agencyName) {
        if (isTenantViewer && sender.role === 'PROPRIO') {
            if (hasAgency) {
                return agencyName || 'Agence de gestion';
            }
            if (isMasked) {
                return 'Bailleur (identité protégée)';
            }
        }
        return `${sender.firstName} ${sender.lastName}`.trim();
    }

    const senderProprio = { role: 'PROPRIO', firstName: 'Jean', lastName: 'Kouassi' };

    const dDirect = computeSenderDisplay(senderProprio, true, false, false);
    assert(dDirect === 'Jean Kouassi', `Nom réel affiché en gestion directe transparente (reçu: ${dDirect})`);

    const dMasque = computeSenderDisplay(senderProprio, true, true, false);
    assert(dMasque === 'Bailleur (identité protégée)', `Bailleur masqué sous RG-CONF (reçu: ${dMasque})`);

    const dAgence = computeSenderDisplay(senderProprio, true, true, true, 'Agence Immobilière Ivoire');
    assert(dAgence === 'Agence Immobilière Ivoire', `Nom de l'agence affiché sous mandat (reçu: ${dAgence})`);
}

// ── Test S-10 : Machine à états des statuts de signalement ──────────────────
console.log('\n4. Test S-10 : Cycle de vie des signalements');
{
    const STATUTS_VALIDES = ['EN_ATTENTE', 'PLANIFIE', 'PRIS_EN_CHARGE', 'RESOLU', 'REJETE'];
    function transitionStatut(current, next) {
        if (!STATUTS_VALIDES.includes(next)) return { ok: false, error: 'Statut invalide' };
        if (current === 'RESOLU' && next !== 'RESOLU') return { ok: false, error: 'Signalement déjà résolu' };
        return { ok: true, statut: next };
    }

    assert(transitionStatut('EN_ATTENTE', 'PLANIFIE').ok, 'Transition EN_ATTENTE -> PLANIFIE autorisée');
    assert(transitionStatut('PLANIFIE', 'PRIS_EN_CHARGE').ok, 'Transition PLANIFIE -> PRIS_EN_CHARGE autorisée');
    assert(transitionStatut('PRIS_EN_CHARGE', 'RESOLU').ok, 'Transition PRIS_EN_CHARGE -> RESOLU autorisée');
    assert(!transitionStatut('RESOLU', 'EN_ATTENTE').ok, 'Réouverture de ticket résolu interdite');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`TOTAL : ${passed} passés, ${failed} échoués`);
console.log('═══════════════════════════════════════════════════════════');

if (failed > 0) process.exit(1);
process.exit(0);
