#!/usr/bin/env node
/**
 * Test de validation pour le processus KYC Bancaire Mobile
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function checkFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Fichier manquant : ${relPath}`);
  }
  return fs.readFileSync(full, 'utf8');
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('🧪 TEST VÉRIFICATION KYC MOBILE BANCAIRE');
console.log('========================================\n');

try {
  // 1. Locataire profile.tsx
  const locProfile = checkFile('native_apps/locataire/app/(tabs)/profile.tsx');
  assert(!locProfile.includes('Ajouter ma pièce d’identité'), 'Locataire : Ancien bouton "Ajouter ma pièce d\'identité" retiré');
  assert(locProfile.includes('Vérification KYC'), 'Locataire : Nouveau bouton "Vérification KYC" présent');
  assert(locProfile.includes('KycVerificationModal'), 'Locataire : Modal KycVerificationModal intégré');

  // 2. Propriétaire profile.tsx
  const propProfile = checkFile('native_apps/proprietaire/app/(tabs)/profile.tsx');
  assert(!propProfile.includes('Ajouter ma pièce d’identité'), 'Propriétaire : Ancien bouton "Ajouter ma pièce d\'identité" retiré');
  assert(propProfile.includes('Vérification KYC'), 'Propriétaire : Nouveau bouton "Vérification KYC" présent');
  assert(propProfile.includes('KycVerificationModal'), 'Propriétaire : Modal KycVerificationModal intégré');

  // 3. Composant KycVerificationModal
  const locModal = checkFile('native_apps/locataire/components/KycVerificationModal.tsx');
  assert(locModal.includes('CNI_CI') && locModal.includes('PASS_CI'), 'KycVerificationModal : Pièces officielles CNI/Passeport supportées');
  assert(locModal.includes('liveness'), 'KycVerificationModal : Contrôle biométrique de vivacité (liveness check) présent');
  assert(locModal.includes('mobileOperator') || locModal.includes('Orange Money'), 'KycVerificationModal : Rapprochement bancaire / Mobile Money présent');
  assert(locModal.includes('/kyc'), 'KycVerificationModal : Appel vers l\'API mobile sécurisée /kyc');

  // 4. API Backend /api/mobile/kyc
  const apiKyc = checkFile('src/app/api/mobile/kyc/route.ts');
  assert(apiKyc.includes('GET'), 'API Backend : Route GET /api/mobile/kyc définie');
  assert(apiKyc.includes('POST'), 'API Backend : Route POST /api/mobile/kyc définie');
  assert(apiKyc.includes('livenessVerified'), 'API Backend : Validation du contrôle de vivacité biométrique');
  assert(apiKyc.includes('generateIdentityHash'), 'API Backend : Hachage d\'identité anti-usurpation');
  assert(apiKyc.includes('BCEAO_LAB_FT_V2') || apiKyc.includes('bankLevelKyc'), 'API Backend : Métadonnées de conformité bancaire');

  // 5. Lexique
  const lexique = JSON.parse(checkFile('config/lexique.json'));
  assert(lexique.identite && lexique.identite.niveau_2_action === 'Vérification KYC', 'Lexique : identite.niveau_2_action aligné sur "Vérification KYC"');
  assert(!lexique._interdits.includes('KYC'), 'Lexique : Mot "KYC" autorisé pour les flux officiels');

} catch (err) {
  console.error('Erreur test:', err.message);
  failed++;
}

console.log('\n========================================');
console.log(`RÉSULTAT: ${passed} PASS, ${failed} FAIL`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
