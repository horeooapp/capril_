const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('Connecting to SSH...');
    await ssh.connect({
      host: '187.77.93.154',
      username: 'root',
      password: 'Qap@server2026',
      port: 2222
    });
    console.log('Connected!');

    const sqlCreate = `
CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "flag_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("flag_id")
);
GRANT ALL PRIVILEGES ON TABLE "public"."feature_flags" TO "qapril_user";
`;

    const allFlags = [
        { id: "M17_FISCAL", name: "Enregistrement Fiscal (M17)", description: "Active le calcul des droits DGI et la génération des certificats fiscaux.", enabled: true },
        { id: "M16_ANAH", name: "Mode Institutionnel ANAH", description: "Permet aux agents ANAH de consulter les baux et certifications.", enabled: true },
        { id: "CDC_CONSIGNATION", name: "Consignation CDC-CI", description: "Gestion des dépôts de garantie auprès de la Caisse des Dépôts.", enabled: true },
        { id: "ASSURANCE_LOYER", name: "Assurance Loyers Impayés", description: "Module de souscription aux assurances partenaires.", enabled: true },
        { id: "MEDIATION_CENTER", name: "Centre de Médiation", description: "Plateforme de résolution des litiges bailleur/locataire.", enabled: true },
        { id: "KYC_VERIFICATION", name: "Vérification d'Identité (KYC)", description: "Validation automatique des pièces d'identité via IA.", enabled: true },
        { id: "SMS_NOTIFICATIONS", name: "Notifications SMS", description: "Envoi de rappels de paiement et alertes par SMS.", enabled: true },
        { id: "USSD_PORTAL", name: "Portail USSD (*600#)", description: "Accès aux services de base sans connexion internet.", enabled: true },
        { id: "NEWS_TICKER", name: "Espace Actualités", description: "Affichage des flash infos et alertes sur le portail.", enabled: true },
        { id: "LANDING_PAGE", name: "Page d'Accueil Marketing", description: "Active ou désactive la Landing Page marketing.", enabled: true },
        { id: "M-EDL", name: "États des Lieux Numériques", description: "Photos, constats et comparatifs entrée/sortie certifiés.", enabled: true },
        { id: "M-SIGN", name: "Signatures Électroniques", description: "Signature de baux et mandats directement sur mobile.", enabled: true },
        { id: "M-MAINT", name: "Maintenance & Travaux", description: "Gestion des pannes, bons de travaux et répertoire prestataires.", enabled: true },
        { id: "M-CAND", name: "Candidatures Locataires", description: "Dossier en ligne, scoring automatique et sélection.", enabled: true },
        { id: "M-CHARGES", name: "Charges Locatives", description: "Appels de charges et régularisations annuelles automatiques.", enabled: true },
        { id: "M-ANNONCES", name: "Publication d'Annonces", description: "Diffusion multi-portails et suivi de la vacance locative.", enabled: true },
        { id: "M-COMPTA", name: "Comptabilité Propriétaire", description: "CRG mensuels, reversements et liasse fiscale.", enabled: true },
        { id: "M-AGENDA", name: "Agenda & CRM Agence", description: "Rendez-vous, tâches et suivi de la relation client.", enabled: true },
        { id: "M_MANDAT", name: "Gestion Multi-Mandats", description: "Permet aux propriétaires de confier leurs biens à plusieurs agences.", enabled: true },
        { id: "M_COLOC", name: "Colocation Native", description: "Gestion des occupants multiples et quittances individuelles.", enabled: true },
        { id: "M_TERRAIN", name: "Location Terrains Nus", description: "Module spécifique pour les parcelles non bâties.", enabled: true },
        { id: "M-PGW", name: "Payment Gateway", description: "Abstraction multi-opérateurs (Wave, Orange, MTN, Moov).", enabled: true },
        { id: "M01-M03", name: "Auth & KYC Core", description: "Fondations de l'identification utilisateur.", enabled: true },
        { id: "M04", name: "Gestion des Baux", description: "Cœur de métier : contrats et loyers.", enabled: true },
        { id: "M16", name: "Fiscalité Générale", description: "Paramétrage fiscal global.", enabled: true },
      ];
  
    let sqlSeed = 'INSERT INTO "public"."feature_flags" ("flag_id", "name", "description", "enabled", "updated_at") VALUES\n';
    sqlSeed += allFlags.map(f => `('${f.id}', '${f.name.replace(/'/g, "''")}', '${f.description.replace(/'/g, "''")}', ${f.enabled}, NOW())`).join(',\n');
    sqlSeed += '\nON CONFLICT ("flag_id") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description";';

    const fullSql = sqlCreate + "\n" + sqlSeed;

    console.log('Executing Create & Seed SQL via sudo -u postgres on VPS...');
    const result = await ssh.execCommand(`sudo -u postgres psql -d qapril <<'EOF'
${fullSql}
EOF
`);

    console.log('STDOUT:', result.stdout);
    console.log('STDERR:', result.stderr);
    
    if (result.code === 0) {
      console.log('Success!');
    } else {
      console.log('Failed with code', result.code);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    ssh.dispose();
  }
}

run();
