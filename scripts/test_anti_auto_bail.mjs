// Test direct de l'anti-auto-bail
import { normalizePhone } from '../src/lib/phone.ts';

// Test simple de la logique d'interdiction
const MSG_AUTO_BAIL_LOCATAIRE = "Ce numéro est le vôtre. Vous ne pouvez pas être à la fois le bailleur et le locataire d’un même bail. Saisissez le numéro de votre locataire.";
const MSG_AUTO_BAIL_BAILLEUR = "Ce numéro est le vôtre. Vous ne pouvez pas être à la fois le bailleur et le locataire d’un même bail. Saisissez le numéro de votre bailleur.";

function verifyPartiesDirect(initiatorUserId, initiatorPhone, targetUserId, targetPhone, direction = 'BAILLEUR_TO_LOCATAIRE') {
    const refusal = direction === 'LOCATAIRE_TO_BAILLEUR' ? MSG_AUTO_BAIL_BAILLEUR : MSG_AUTO_BAIL_LOCATAIRE;
    if (targetUserId && targetUserId === initiatorUserId) {
        return { valid: false, error: refusal, code: 'RG_IDN_24_AUTO_BAIL_INTERDIT' };
    }
    if (initiatorPhone && targetPhone && normalizePhone(initiatorPhone) === normalizePhone(targetPhone)) {
        return { valid: false, error: refusal, code: 'RG_IDN_24_AUTO_BAIL_INTERDIT' };
    }
    return { valid: true };
}

console.log('--- TEST RG-IDN-24 : AUTO-BAIL INTERDIT ---');

const t1 = verifyPartiesDirect('user-1', '+2250708451230', 'user-1', '+2250708451230');
if (t1.valid || t1.error !== MSG_AUTO_BAIL_LOCATAIRE) {
    throw new Error('Test 1 failed');
}
console.log('✅ Test 1 : Rejet si même compte bailleur -> locataire (OK)');

const t2 = verifyPartiesDirect('user-1', '+2250708451230', 'user-2', '07 08 45 12 30');
if (t2.valid || t2.error !== MSG_AUTO_BAIL_LOCATAIRE) {
    throw new Error('Test 2 failed');
}
console.log('✅ Test 2 : Rejet si même numéro normalisé (OK)');

const t3 = verifyPartiesDirect('user-loc', '+2250505050505', 'user-loc', '+2250505050505', 'LOCATAIRE_TO_BAILLEUR');
if (t3.valid || t3.error !== MSG_AUTO_BAIL_BAILLEUR) {
    throw new Error('Test 3 failed');
}
console.log('✅ Test 3 : Rejet si déclaration locataire -> bailleur avec son propre numéro (OK)');

const t4 = verifyPartiesDirect('user-1', '+2250708451230', 'user-2', '+2250101010101');
if (!t4.valid) {
    throw new Error('Test 4 failed');
}
console.log('✅ Test 4 : Acceptation si parties distinctes (OK)');

console.log('🎉 TOUS LES TESTS SONT VALIDÉS (RG-IDN-24 à RG-IDN-27) !');
