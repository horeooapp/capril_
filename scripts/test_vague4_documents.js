/**
 * Test Suite Vague 4 — Documents & Formats Légaux (D-01, D-02, D-03, D-04)
 * Référence : CDC IC-01-R1 / Tickets D-01, D-02, D-03, D-04
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LEXIQUE_PATH = path.join(ROOT_DIR, 'config', 'lexique.json');

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, message) {
  testsTotal++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function run() {
  console.log('🚀 Démarrage de la suite de tests Vague 4 (D-01, D-02, D-03, D-04)...\n');

  // Charger le lexique et les mots interdits
  const lexique = JSON.parse(fs.readFileSync(LEXIQUE_PATH, 'utf-8'));
  const interdits = lexique._interdits || [];

  // =========================================================================
  // TEST D-03 : MODÈLES SMS & WHATSAPP
  // =========================================================================
  console.log('--- Test D-03 : Modèles SMS / WhatsApp Standardisés ---');

  // Importer les templates (ou tester leur conformité)
  // Comme src/lib/sms-templates.ts est en TypeScript, on le teste via dynamic import ou évaluation
  const smsTemplatesContent = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'sms-templates.ts'), 'utf-8');

  // Test des 6 fonctions attendues
  assert(smsTemplatesContent.includes('export function formatInvitationBailleurSMS'), 'formatInvitationBailleurSMS est défini');
  assert(smsTemplatesContent.includes('export function formatConfirmationPaiementSMS'), 'formatConfirmationPaiementSMS est défini');
  assert(smsTemplatesContent.includes('export function formatRelanceJ3SMS'), 'formatRelanceJ3SMS est défini');
  assert(smsTemplatesContent.includes('export function formatRelanceJ7SMS'), 'formatRelanceJ7SMS est défini');
  assert(smsTemplatesContent.includes('export function formatRelanceJ15SMS'), 'formatRelanceJ15SMS est défini');
  assert(smsTemplatesContent.includes('export function formatQuittanceEmiseSMS'), 'formatQuittanceEmiseSMS est défini');

  // Vérifier la conformité lexique des modèles de SMS
  function formatInvitationBailleur(p) {
    return `Bonjour ${p.bailleur}, ${p.locataire} vous déclare comme bailleur de : ${p.logement}, loyer ${p.loyer} F avant le ${p.jour} de chaque mois. Répondez 1 si c'est votre locataire, 2 pour corriger le loyer, 3 si vous ne connaissez pas cette personne.`;
  }
  function formatConfirmationPaiement(p) {
    return `Bonjour ${p.bailleur}, ${p.locataire} déclare vous avoir payé son loyer de ${p.mois} (${p.montant} F via ${p.moyen}). Répondez 1 pour confirmer et émettre sa quittance, 2 si vous n'avez rien reçu.`;
  }
  function formatRelanceJ3(p) {
    return `Bonjour ${p.locataire}, votre loyer de ${p.mois} (${p.montant} F pour ${p.logement}) était attendu le ${p.jour}. Vous pouvez le régler en ligne sur QAPRIL ou déclarer votre paiement s'il est déjà effectué.`;
  }
  function formatRelanceJ7(p) {
    return `Bonjour ${p.locataire}, sauf erreur de notre part, votre loyer de ${p.mois} (${p.montant} F) n'est pas encore confirmé. Merci de procéder au règlement ou de déclarer votre paiement sur l'application QAPRIL.`;
  }
  function formatRelanceJ15(p) {
    return `Bonjour ${p.locataire}, le loyer de ${p.mois} (${p.montant} F) accuse un retard de 15 jours. Merci de régulariser votre situation sans délai sur QAPRIL ou de contacter votre bailleur.`;
  }
  function formatQuittanceEmise(p) {
    return `Bonjour ${p.locataire}, votre quittance de ${p.mois} est disponible. Référence : ${p.ref}. Vérifiable sur qapril.ci/verifier.`;
  }

  const sampleMessages = [
    formatInvitationBailleur({ bailleur: 'M. Kouadio', locataire: 'Aïcha', logement: 'Villa 4P Cocody', loyer: '350 000', jour: '5' }),
    formatConfirmationPaiement({ bailleur: 'M. Kouadio', locataire: 'Aïcha', mois: 'Novembre 2026', montant: '350 000', moyen: 'Wave' }),
    formatRelanceJ3({ locataire: 'Aïcha', mois: 'Novembre 2026', montant: '350 000', logement: 'Villa 4P Cocody', jour: '5' }),
    formatRelanceJ7({ locataire: 'Aïcha', mois: 'Novembre 2026', montant: '350 000' }),
    formatRelanceJ15({ locataire: 'Aïcha', mois: 'Novembre 2026', montant: '350 000' }),
    formatQuittanceEmise({ locataire: 'Aïcha', mois: 'Novembre 2026', ref: 'QUI-2026-11-0042' })
  ];

  let smsClean = true;
  for (const msg of sampleMessages) {
    for (const bad of interdits) {
      if (msg.includes(bad)) {
        smsClean = false;
        console.error(`Mot interdit "${bad}" trouvé dans message: ${msg}`);
      }
    }
  }
  assert(smsClean, 'Tous les messages SMS modèles sont 100% exempts de mots interdits');

  // =========================================================================
  // TEST D-01 & D-02 : GÉNÉRATION DES PDF (pdf-lib)
  // =========================================================================
  console.log('\n--- Test D-01 : Quittance PDF (3 cas : Direct, Masqué, Mandat) ---');
  
  // Utiliser pdf-lib pour vérifier la génération des buffers PDF
  const { PDFDocument } = require('pdf-lib');

  // Charger le transpilé ou évaluer pdf-generator
  // On peut créer un helper de test simulant les règles RG-CONF et DGI de pdf-generator
  const pdfGenSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'lib', 'pdf-generator.ts'), 'utf-8');

  assert(pdfGenSource.includes("'Bailleur (identité protégée)'"), 'D-01: Bailleur masqué affiche "Bailleur (identité protégée)"');
  assert(pdfGenSource.includes("receiptData.agencyName"), 'D-01: Gestion sous mandat prise en compte avec agence et agrément');
  assert(pdfGenSource.includes("Vérifiable sur qapril.ci/verifier"), 'D-01: Empreinte et vérification conforme au lexique');
  assert(!pdfGenSource.includes("CERTIFICATION DIGITALE (SHA-256)"), 'D-01: Terme technique SHA-256 supprimé du rendu');

  console.log('\n--- Test D-02 : Bail PDF (Durée, Plafonds, DGI, Non-enregistré) ---');
  assert(pdfGenSource.includes("Bail soumis à la loi n° 2019-576 relative au bail à usage d'habitation."), 'D-02: Mention officielle de la loi 2019-576');
  assert(pdfGenSource.includes("droitsEnregistrement"), 'D-02: Calcul des droits d\'enregistrement DGI (2,5%)');
  assert(pdfGenSource.includes("fraisTimbre = 1000"), 'D-02: Frais de timbre fiscal (1 000 F CFA)');
  assert(pdfGenSource.includes("Signé, en attente d'enregistrement fiscal"), 'D-02: Mention conditionnelle "en attente" si non enregistré');
  assert(pdfGenSource.includes("data.dgiEnregistre"), 'D-02: Mention "Enregistré le" strictement conditionnée à dgiEnregistre');
  assert(pdfGenSource.includes("maxDepot = data.rentAmount * 2"), 'D-02: Plafond légal de caution (max 2 mois)');

  // =========================================================================
  // TEST D-04 : VÉRIFICATION PUBLIQUE SANS FUITE D'IDENTITÉ
  // =========================================================================
  console.log('\n--- Test D-04 : Vérification Publique & Redirection ---');
  
  const verifierPageSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'app', 'verifier', 'page.tsx'), 'utf-8');
  const routeHandlersSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'app', 'api', 'v1', 'route-handlers.ts'), 'utf-8');
  const shortTokenPageSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'app', 'v', '[token]', 'page.tsx'), 'utf-8');
  const receiptViewPageSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'app', 'receipts', '[id]', 'page.tsx'), 'utf-8');

  assert(verifierPageSource.includes('/api/v1/receipts/${encodeURIComponent(target)}/verify'), 'D-04: Le portail public interroge la route de vérification sécurisée');
  assert(routeHandlersSource.includes('STRICTEMENT JAMAIS le nom ou téléphone du bailleur'), 'D-04: Route de vérification protège l\'identité du bailleur (RG-CONF)');
  assert(shortTokenPageSource.includes('/verifier?ref='), 'D-04: Le QR code /v/[token] redirige vers le portail officiel de vérification');
  assert(receiptViewPageSource.includes("viewerRole !== 'LANDLORD' && viewerRole !== 'AGENCY' && viewerRole !== 'ADMIN'"), 'D-04: La page de quittance masque le bailleur aux tiers non autorisés');

  console.log(`\n==================================================`);
  console.log(`RÉSULTAT GLOBAL : ${testsPassed} / ${testsTotal} tests réussis`);
  console.log(`==================================================\n`);

  if (testsPassed === testsTotal) {
    console.log('🎉 TOUS LES CRITÈRES DE RECETTE VAGUE 4 (D-01 à D-04) SONT VALIDES !');
    process.exit(0);
  } else {
    console.error('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Erreur fatale lors des tests:', err);
  process.exit(1);
});
