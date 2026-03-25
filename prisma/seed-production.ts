import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initialisation des données de production (Modules & Actualités)...");

  // 1. FEATURE FLAGS (Modules Cores)
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
    { id: "M-PGW", name: "Payment Gateway", description: "Abstraction multi-opérateurs (Wave, Orange, MTN, Moov).", enabled: true },
    { id: "M-EDL", name: "États des Lieux Numériques", enabled: true },
    { id: "M-SIGN", name: "Signatures Électroniques", enabled: true },
    { id: "M-MAINT", name: "Maintenance & Travaux", enabled: true },
    { id: "M-COMPTA", name: "Comptabilité Propriétaire", enabled: true },
  ];

  for (const flag of allFlags) {
    await prisma.featureFlag.upsert({
      where: { id: flag.id },
      update: { name: flag.name, enabled: flag.enabled },
      create: flag,
    });
  }
  console.log(`✅ ${allFlags.length} Feature Flags initialisés.`);

  // 2. NEWS TICKER (Actualités)
  const news = [
    { content: "BIENVENUE SUR QAPRIL : PORTAIL NATIONAL DE NORMALISATION DU MARCHÉ LOCATIF.", priority: 10 },
    { content: "DIGITALISATION : TOUTES LES CAUTIONS IMMOBILIÈRES DOIVENT ÊTRE DÉPOSÉES À LA CDC-CI.", priority: 9 },
    { content: "INNOVATION : LE REGISTRE LOCATIF NATIONAL SÉCURISE VOS TRANSACTIONS IMMOBILIÈRES.", priority: 8 },
  ]

  for (const item of news) {
    await prisma.newsTicker.create({
      data: item
    })
  }
  console.log(`✅ ${news.length} Actualités initialisées.`);

  console.log("🚀 Seeding terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
