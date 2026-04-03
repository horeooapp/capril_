"use server";
// QAPRIL - Signalements - Version finale - Utilise TicketMaintenance
// REMPLACE etape 9 - ADD-11 + ADD-17 fusionnes

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Categories valides (enum SignalCatEnum du schema)
export const CATEGORIES_SIGNALEMENT = [
  { value: "FUITE_EAU",     label: "Plomberie / Fuite d'eau" },
  { value: "ELECTRICITE",   label: "Electricite" },
  { value: "PORTE_SERRURE", label: "Serrurerie / Porte" },
  { value: "NUISANCE",      label: "Nuisance / Structure" },
  { value: "DEGRADATION",   label: "Menuiserie / Degradation" },
  { value: "AUTRE",         label: "Autre" },
] as const;

// Creer un signalement locataire
export async function createSignalement(data: {
  leaseId:      string;
  locataireId:  string;
  logementId?:  string;
  categorie:    string;
  description:  string;
  urgence?:     "URGENTE" | "NORMALE" | "BASSE";
  photoUrl?:    string;
}) {
  const ref = "MAI-" + Date.now().toString(36).toUpperCase();
  const ticket = await prisma.ticketMaintenance.create({
    data: {
      ticketRef:       ref,
      leaseId:         data.leaseId,
      locataireId:     data.locataireId,
      logementId:      data.logementId,
      categorie:       data.categorie,
      description:     data.description,
      urgence:         data.urgence ?? "NORMALE",
      photoUrl:        data.photoUrl,
      statut:          "EN_ATTENTE",
      dateSignalement: new Date(),
    }
  });
  revalidatePath("/dashboard/locataire");
  return { success: true, ticket };
}

// Signalements du locataire
export async function getSignalementsLocataire(locataireId: string) {
  return prisma.ticketMaintenance.findMany({
    where:   { locataireId },
    orderBy: { dateSignalement: "desc" }
  });
}

// Signalements d'un bien (bailleur)
export async function getSignalementsForProperty(logementId: string) {
  return prisma.ticketMaintenance.findMany({
    where:   { logementId },
    include: {
      locataire:   { select: { firstName: true, lastName: true, phone: true } },
      prestataire: { select: { nom: true, telephone: true, specialite: true } }
    },
    orderBy: { dateSignalement: "desc" }
  });
}

// Marquer vu par le bailleur (proprio_vu_at)
export async function marquerVuParBailleur(ticketId: string) {
  return prisma.ticketMaintenance.update({
    where: { id: ticketId },
    data: {
      proprioVuAt:       new Date(),
      statut:            "PRIS_EN_CHARGE",
      datePriseEnCharge: new Date()
    }
  });
}

// Mettre a jour le statut (bailleur/agent)
export async function updateSignalementStatut(ticketId: string, data: {
  statut:              string;
  commentaireProprio?: string;
  dateResolution?:     Date;
  prestataireId?:      string;
  devisMontant?:       number;
  coutFinal?:          number;
  dateIntervention?:   Date;
}) {
  return prisma.ticketMaintenance.update({
    where: { id: ticketId },
    data: {
      statut:             data.statut,
      commentaireProprio: data.commentaireProprio,
      dateResolution:     data.dateResolution,
      prestataireId:      data.prestataireId,
      devisMontant:       data.devisMontant,
      coutFinal:          data.coutFinal,
      dateIntervention:   data.dateIntervention,
      datePriseEnCharge:  data.statut === "PRIS_EN_CHARGE" ? new Date() : undefined,
      closedAt:           ["RESOLU","CLOTURE"].includes(data.statut) ? new Date() : undefined,
    }
  });
}

// Locataire confirme resolution + note satisfaction (1-5)
export async function confirmerResolutionLocataire(
  ticketId: string,
  note:     number,
  confirme: boolean
) {
  return prisma.ticketMaintenance.update({
    where: { id: ticketId },
    data: {
      confirmationLoc:  confirme,
      noteLocataire:    Math.min(5, Math.max(1, note)),
      dateConfirmation: new Date(),
      statut:           confirme ? "RESOLU" : "CONTESTE",
      closedAt:         confirme ? new Date() : undefined,
    }
  });
}

// Stats signalements pour dashboard bailleur
export async function getStatsSignalements(landlordId: string) {
  const leases = await prisma.lease.findMany({
    where:  { landlordId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
    select: { id: true }
  });
  const ids = leases.map(l => l.id);
  const [enAttente, enCours, resolus] = await Promise.all([
    prisma.ticketMaintenance.count({ where: { leaseId:{in:ids}, statut:"EN_ATTENTE" } }),
    prisma.ticketMaintenance.count({ where: { leaseId:{in:ids}, statut:"PRIS_EN_CHARGE" } }),
    prisma.ticketMaintenance.count({ where: { leaseId:{in:ids}, statut:{in:["RESOLU","CLOTURE"]} } }),
  ]);
  return { enAttente, enCours, resolus, total: enAttente + enCours + resolus };
}
