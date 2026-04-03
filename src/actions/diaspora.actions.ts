"use server";
// QAPRIL - Package Diaspora - RG-DIA-01 a 04

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TAUX_EUR_FCFA = 655.957; // Fixe - jamais modifiable

// Activer le package diaspora
export async function activerDiaspora(userId: string, data: {
  diasporaStripeId: string;
  diasporaWhatsapp?: string;
  paysResidence:    string;
  fuseauHoraire?:   string;
  emailRapport?:    string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      diasporaProfile: {
        upsert: {
          create: {
            diasporaAbonnement:      true,
            diasporaAbonnementSince: new Date(),
            diasporaDevise:          "EUR",
            diasporaStripeId:        data.diasporaStripeId,
            diasporaWhatsapp:        data.diasporaWhatsapp,
            paysResidence:           data.paysResidence,
            fuseauHoraire:           (data.fuseauHoraire || "Africa/Abidjan") ?? "Europe/Paris",
            emailRapportMensuel:     data.emailRapport,
          },
          update: {
            diasporaAbonnement:      true,
            diasporaAbonnementSince: new Date(),
            diasporaDevise:          "EUR",
            diasporaStripeId:        data.diasporaStripeId,
            diasporaWhatsapp:        data.diasporaWhatsapp,
            paysResidence:           data.paysResidence,
            fuseauHoraire:           (data.fuseauHoraire || "Africa/Abidjan") ?? "Europe/Paris",
            emailRapportMensuel:     data.emailRapport,
          }
        }
      }
    }
  });
}

// Generer un rapport mensuel avec conversion EUR
export async function genererRapportMensuel(userId: string, mois: number, annee: number) {
  // Recuperer les donnees du mois
  const dateDebut = new Date(annee, mois - 1, 1);
  const dateFin   = new Date(annee, mois, 0);

  const leases = await prisma.lease.findMany({
    where: { landlordId: userId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
    include: {
      receipts: { where: { paidAt: { gte: dateDebut, lte: dateFin }, status: "paid" } },
      property: { select: { commune: true, address: true, propertyCode: true } }
    }
  });

  const totalFcfa = leases.reduce((s,l) => s + l.receipts.reduce((r,q) => r + q.totalAmount,0), 0);
  const totalEur  = parseFloat((totalFcfa / TAUX_EUR_FCFA).toFixed(2));

  const dataRapport = {
    periode: `${mois.toString().padStart(2,"0")}/${annee}`,
    totalFcfa, totalEur, tauxChange: TAUX_EUR_FCFA,
    dateGeneration: new Date().toISOString(),
    leases: leases.map(l => ({
      bien:         l.property.propertyCode,
      commune:      l.property.commune,
      loyerFcfa:    l.rentAmount,
      loyerEur:     parseFloat((l.rentAmount / TAUX_EUR_FCFA).toFixed(2)),
      quittances:   l.receipts.length,
    }))
  };

  return prisma.rapportMensuel.upsert({
    where: { userId_periodeMois_periodeAnnee_typeRapport: {
      userId, periodeMois: mois, periodeAnnee: annee, typeRapport: "MENSUEL"
    }},
    update: { dataRapport },
    create: { userId, periodeMois: mois, periodeAnnee: annee, typeRapport: "MENSUEL", dataRapport }
  });
}

// Statut abonnement diaspora
export async function getStatutDiaspora(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { diasporaProfile: true }
  });
  return user?.diasporaProfile;
}
