import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initialisation des Feature Flags QAPRIL...");

  const flags = [
    { id: "M01-M03", name: "Authentification & KYC", description: "Gestion des comptes, connexions et certification d'identité.", enabled: true },
    { id: "M04", name: "Gestion des Baux", description: "Création, signature et suivi des contrats de location.", enabled: true },
    { id: "M05", name: "Mandats & Agences", description: "Gestion des mandats de gestion et des comptes agences.", enabled: true },
    { id: "M06-M09", name: "Maintenance & Travaux", description: "Signalement d'incidents, devis et suivi des réparations.", enabled: true },
    { id: "M10-M11", name: "Médiation & Contentieux", description: "Gestion des impayés, clémences et procédures juridiques.", enabled: true },
    { id: "M16", name: "Fiscalité (DGI/M17)", description: "Déclaration et paiement automatique des taxes foncières.", enabled: true },
    { id: "M-PGW", name: "Payment Gateway", description: "Abstraction multi-opérateurs (Wave, Orange, MTN, Moov).", enabled: true },
  ];

  for (const flag of flags) {
    await (prisma as any).featureFlag.upsert({
      where: { id: flag.id },
      update: { name: flag.name, description: flag.description },
      create: flag,
    });
  }

  console.log(`✅ ${flags.length} modules configurés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
