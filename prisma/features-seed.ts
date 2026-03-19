import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Migration des Feature Flags vers la nouvelle table...");

  const existingFlags = [
    { id: "M17_FISCAL", name: "Fiscalité M17 (DGI)", description: "Déclaration et paiement automatique des taxes foncières.", enabled: true },
    { id: "CDC_CONSIGNATION", name: "Consignation CDC", description: "Sécurisation des cautions via la Caisse des Dépôts.", enabled: true },
    { id: "ASSURANCE_LOYER", name: "Assurance Impayés", description: "Protection contre les loyers impayés (Pack Sécurité).", enabled: true },
    { id: "MEDIATION_CENTER", name: "Centre de Médiation", description: "Plateforme de résolution amiable des litiges.", enabled: true },
    { id: "LANDING_PAGE", name: "Page d'Accueil", description: "Affichage de la page de destination publique.", enabled: true },
    { id: "M01-M03", name: "Authentification & KYC", description: "Gestion des comptes et certification d'identité.", enabled: true },
    { id: "M04", name: "Gestion des Baux", description: "Création et suivi des baux.", enabled: true },
    { id: "M05", name: "Mandats & Agences", description: "Gestion des mandats agences.", enabled: true },
    { id: "M06-M09", name: "Maintenance & Travaux", description: "Incidents et travaux.", enabled: true },
    { id: "M-PGW", name: "Payment Gateway", description: "Abstraction multi-opérateurs.", enabled: true },
  ];

  for (const flag of existingFlags) {
    await (prisma as any).featureFlag.upsert({
      where: { id: flag.id },
      update: { name: flag.name, description: flag.description },
      create: flag,
    });
  }

  console.log(`✅ ${existingFlags.length} flags migrés/initialisés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
