import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Unification de tous les Feature Flags QAPRIL (ADD-03 inclus)...");

  const allFlags = [
    // Modules Système / Institutionnels
    { id: "M17_FISCAL", name: "Enregistrement Fiscal (M17)", description: "Active le calcul des droits DGI et la génération des certificats fiscaux.", enabled: true },
    { id: "M16_ANAH", name: "Mode Institutionnel ANAH", description: "Permet aux agents ANAH de consulter les baux et certifications.", enabled: true },
    { id: "CDC_CONSIGNATION", name: "Consignation CDC-CI", description: "Gestion des dépôts de garantie auprès de la Caisse des Dépôts.", enabled: true },
    { id: "ASSURANCE_LOYER", name: "Assurance Loyers Impayés", description: "Module de souscription aux assurances partenaires.", enabled: true },
    { id: "MEDIATION_CENTER", name: "Centre de Médiation", description: "Plateforme de résolution des litiges bailleur/locataire.", enabled: true },
    
    // Services Utilisateurs
    { id: "KYC_VERIFICATION", name: "Vérification d'Identité (KYC)", description: "Validation automatique des pièces d'identité via IA.", enabled: true },
    { id: "SMS_NOTIFICATIONS", name: "Notifications SMS", description: "Envoi de rappels de paiement et alertes par SMS.", enabled: true },
    { id: "USSD_PORTAL", name: "Portail USSD (*600#)", description: "Accès aux services de base sans connexion internet.", enabled: true },
    { id: "NEWS_TICKER", name: "Espace Actualités", description: "Affichage des flash infos et alertes sur le portail.", enabled: true },
    { id: "LANDING_PAGE", name: "Page d'Accueil Marketing", description: "Active ou désactive la Landing Page marketing.", enabled: true },
    
    // Modules de Rétention Agences (ADD-03)
    { id: "M-EDL", name: "États des Lieux Numériques", description: "Photos, constats et comparatifs entrée/sortie certifiés.", enabled: true },
    { id: "M-SIGN", name: "Signatures Électroniques", description: "Signature de baux et mandats directement sur mobile.", enabled: true },
    { id: "M-MAINT", name: "Maintenance & Travaux", description: "Gestion des pannes, bons de travaux et répertoire prestataires.", enabled: true },
    { id: "M-CAND", name: "Candidatures Locataires", description: "Dossier en ligne, scoring automatique et sélection.", enabled: true },
    { id: "M-CHARGES", name: "Charges Locatives", description: "Appels de charges et régularisations annuelles automatiques.", enabled: true },
    { id: "M-ANNONCES", name: "Publication d'Annonces", description: "Diffusion multi-portails et suivi de la vacance locative.", enabled: true },
    { id: "M-COMPTA", name: "Comptabilité Propriétaire", description: "CRG mensuels, reversements et liasse fiscale.", enabled: true },
    { id: "M-AGENDA", name: "Agenda & CRM Agence", description: "Rendez-vous, tâches et suivi de la relation client.", enabled: true },

    // Nouveaux Modules Business & Fondations
    { id: "M_MANDAT", name: "Gestion Multi-Mandats", description: "Permet aux propriétaires de confier leurs biens à plusieurs agences.", enabled: true },
    { id: "M_COLOC", name: "Colocation Native", description: "Gestion des occupants multiples et quittances individuelles.", enabled: true },
    { id: "M_TERRAIN", name: "Location Terrains Nus", description: "Module spécifique pour les parcelles non bâties.", enabled: true },
    { id: "M-PGW", name: "Payment Gateway", description: "Abstraction multi-opérateurs (Wave, Orange, MTN, Moov).", enabled: true },
    
    // Mappage CDC v3.0
    { id: "M01-M03", name: "Auth & KYC Core", description: "Fondations de l'identification utilisateur.", enabled: true },
    { id: "M04", name: "Gestion des Baux", description: "Cœur de métier : contrats et loyers.", enabled: true },
    { id: "M16", name: "Fiscalité Générale", description: "Paramétrage fiscal global.", enabled: true },
  ];

  for (const flag of allFlags) {
    await (prisma as any).featureFlag.upsert({
      where: { id: flag.id },
      update: { name: flag.name, description: flag.description },
      create: flag,
    });
  }

  console.log(`✅ ${allFlags.length} flags unifiés et initialisés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
