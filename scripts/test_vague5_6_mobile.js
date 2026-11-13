const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
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
console.log('🧪 TEST VAGUE 5 & VAGUE 6 — APPS MOBILES');
console.log('========================================\n');

// 1. Navigation Locataire (ML-05)
console.log('--- 1. Navigation Locataire (ML-05) ---');
const locLayout = fs.readFileSync(path.join(ROOT, 'native_apps/locataire/app/(tabs)/_layout.tsx'), 'utf-8');
assert(locLayout.includes("title: 'Accueil'"), "Tab Accueil présent");
assert(locLayout.includes("title: 'Mon bail'"), "Tab Mon bail présent");
assert(locLayout.includes("title: 'Payer'"), "Tab Payer présent");
assert(locLayout.includes("title: 'Recherche'"), "Tab Recherche présent");
assert(locLayout.includes("title: 'Moi'"), "Tab Moi présent (conformité lexique)");

// 2. Navigation Propriétaire (MB-03)
console.log('\n--- 2. Navigation Propriétaire (MB-03) ---');
const propLayout = fs.readFileSync(path.join(ROOT, 'native_apps/proprietaire/app/(tabs)/_layout.tsx'), 'utf-8');
assert(propLayout.includes("title: 'Accueil'"), "Tab Accueil présent");
assert(propLayout.includes("title: 'Biens'"), "Tab Biens présent");
assert(propLayout.includes("title: 'Baux'"), "Tab Baux présent");
assert(propLayout.includes("title: 'Flux'"), "Tab Flux présent");
assert(propLayout.includes("title: 'Plus'"), "Tab Plus présent");

// 3. Navigation Agence (MA-03)
console.log('\n--- 3. Navigation Agence (MA-03) ---');
const agLayout = fs.readFileSync(path.join(ROOT, 'native_apps/agence/app/(tabs)/_layout.tsx'), 'utf-8');
assert(agLayout.includes("title: 'Accueil'"), "Tab Accueil présent");
assert(agLayout.includes("title: 'Portefeuille'"), "Tab Portefeuille présent");
assert(agLayout.includes("title: 'Mandants'"), "Tab Mandants présent");
assert(agLayout.includes("title: 'Candidats'"), "Tab Candidats présent");
assert(agLayout.includes("title: 'Plus'"), "Tab Plus présent");

// 4. Écrans P1 créés
console.log('\n--- 4. Fichiers Écrans P1 & P2 ---');
const filesToCheck = [
  'native_apps/locataire/app/(tabs)/bail.tsx',
  'native_apps/locataire/app/(tabs)/payer.tsx',
  'native_apps/locataire/app/(tabs)/recherche.tsx',
  'native_apps/locataire/app/(tabs)/passeport.tsx',
  'native_apps/proprietaire/app/(tabs)/baux.tsx',
  'native_apps/proprietaire/app/(tabs)/diaspora.tsx',
  'native_apps/agence/app/(tabs)/portefeuille.tsx',
  'native_apps/agence/app/(tabs)/mandants.tsx',
  'native_apps/agence/app/(tabs)/candidats.tsx',
  'native_apps/agence/app/(tabs)/plus.tsx',
];

for (const f of filesToCheck) {
  assert(fs.existsSync(path.join(ROOT, f)), `Écran ${f} existe`);
}

// 5. Bouton Micro (ML-06 / MB-04 / MA-04)
console.log('\n--- 5. Bouton Micro (ML-06 / MB-04) ---');
const fabLoc = fs.readFileSync(path.join(ROOT, 'native_apps/locataire/components/VoiceAssistantFAB.tsx'), 'utf-8');
assert(fabLoc.includes('bottom: 80'), "VoiceAssistantFAB Locataire a bottom: 80 px");
assert(fabLoc.includes('visible?: boolean'), "VoiceAssistantFAB Locataire accepte visible prop");

const fabProp = fs.readFileSync(path.join(ROOT, 'native_apps/proprietaire/components/VoiceAssistantFAB.tsx'), 'utf-8');
assert(fabProp.includes('bottom: 80'), "VoiceAssistantFAB Propriétaire a bottom: 80 px");
assert(fabProp.includes('visible?: boolean'), "VoiceAssistantFAB Propriétaire accepte visible prop");

// 6. Messagerie (ML-12 / MB-05 / MA-05)
console.log('\n--- 6. Messagerie (ML-12 / MB-05) ---');
const chatLoc = fs.readFileSync(path.join(ROOT, 'native_apps/locataire/app/(tabs)/chat.tsx'), 'utf-8');
assert(!chatLoc.includes('Messagerie Sécurisée'), "Locataire : 'Messagerie Sécurisée' retiré");
assert(!chatLoc.includes('>EN DIRECT<'), "Locataire : Badge 'EN DIRECT' retiré");
assert(chatLoc.includes("interlocutorName === 'Bailleur (identité protégée)'"), "Locataire : Bandeau identité protégée présent");

const chatProp = fs.readFileSync(path.join(ROOT, 'native_apps/proprietaire/app/(tabs)/chat.tsx'), 'utf-8');
assert(!chatProp.includes('>EN DIRECT<'), "Propriétaire : Badge 'EN DIRECT' retiré");

// 7. Agence lib/api.ts
console.log('\n--- 7. Agence API ---');
const agApi = fs.readFileSync(path.join(ROOT, 'native_apps/agence/lib/api.ts'), 'utf-8');
assert(agApi.includes('export async function logoutAndRedirect'), "logoutAndRedirect présent dans agence/lib/api.ts");

// 8. Baux & Création Bail (MB-07, MB-09)
console.log('\n--- 8. Baux & Création Bail (MB-07, MB-09) ---');
const bauxContent = fs.readFileSync(path.join(ROOT, 'native_apps/proprietaire/app/(tabs)/baux.tsx'), 'utf-8');
assert(bauxContent.includes('bailleurMasque'), "baux.tsx contient l'interrupteur bailleurMasque");

const createLeaseContent = fs.readFileSync(path.join(ROOT, 'native_apps/proprietaire/app/create-lease.tsx'), 'utf-8');
assert(createLeaseContent.includes("Droits d'enregistrement DGI estimés"), "create-lease.tsx contient le récapitulatif DGI");
assert(createLeaseContent.includes("paymentDay"), "create-lease.tsx gère le jour d'échéance");

// 9. Mandats Agence (MA-06)
console.log('\n--- 9. Mandats Agence (MA-06) ---');
const mandantsContent = fs.readFileSync(path.join(ROOT, 'native_apps/agence/app/(tabs)/mandants.tsx'), 'utf-8');
assert(mandantsContent.includes('signatureMandant'), "Double signature mandant présente");
assert(mandantsContent.includes('signatureAgence'), "Double signature agence présente");
assert(mandantsContent.includes('48h'), "Réclamation 48h mentionnée");

console.log('\n========================================');
console.log(`RÉSULTAT: ${passed} PASS, ${failed} FAIL`);
console.log('========================================\n');

process.exit(failed === 0 ? 0 : 1);

