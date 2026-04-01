"use server";
// QAPRIL - signalement.actions.ts
// Convention : "signalement" cote TypeScript/React
//              TicketMaintenance cote Prisma/base de donnees

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type SignalementQapril - alias de TicketMaintenance
// Les composants React utilisent ce type, pas TicketMaintenance
export type SignalementQapril = {
  id:               string;
  signalementRef:   string;   // = ticketRef dans la DB
  categorie:        string;
  description:      string;
  urgence:          "URGENTE" | "NORMALE" | "BASSE";
  statut:           string;
  dateSignalement:  Date;
  proprioVuAt?:     Date | null;
  datePriseEnCharge?: Date | null;
  dateResolution?:  Date | null;
  noteLocataire?:   number | null;  // 1 a 5 etoiles
  confirmationLoc?: boolean | null;
  photoUrl?:        string | null;
};

// Categories affichees a l'utilisateur
export const CATEGORIES_SIGNALEMENT = [
  { value: "FUITE_EAU",     label: "Plomberie / Fuite d'eau",     icon: "pipe" },
  { value: "ELECTRICITE",   label: "Electricite",                  icon: "electric" },
  { value: "PORTE_SERRURE", label: "Serrurerie / Porte",           icon: "lock" },
  { value: "NUISANCE",      label: "Nuisance sonore / Structure",  icon: "home" },
  { value: "DEGRADATION",   label: "Menuiserie / Degradation",     icon: "window" },
  { value: "AUTRE",         label: "Autre",                        icon: "other" },
] as const;

// Labels statuts affiches a l'utilisateur (pas les valeurs DB)
export const STATUTS_SIGNALEMENT: Record<string, string> = {
  "EN_ATTENTE":    "En attente de traitement",
  "PRIS_EN_CHARGE":"Pris en charge",
  "RESOLU":        "Resolu",
  "CONTESTE":      "Conteste",
  "CLOTURE":       "Cloture",
};

// Creer un signalement (locataire)
// Note : cree un TicketMaintenance en base, renvoie un SignalementQapril
export async function creerSignalement(data: {
  leaseId:      string;
  locataireId:  string;
  logementId?:  string;
  categorie:    string;
  description:  string;
  urgence?:     "URGENTE" | "NORMALE" | "BASSE";
  photoUrl?:    string;
}): Promise<SignalementQapril> {
  // Reference visible locataire : SIG- (pas MAI-)
  const ref = "SIG-" + Date.now().toString(36).toUpperCase();
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
  return mapToSignalement(ticket);
}

// Signalements du locataire (liste)
export async function getSignalementsLocataire(
  locataireId: string
): Promise<SignalementQapril[]> {
  const tickets = await prisma.ticketMaintenance.findMany({
    where:   { locataireId },
    orderBy: { dateSignalement: "desc" }
  });
  return tickets.map(mapToSignalement);
}

// Signalements d'un bien (bailleur/agent)
export async function getSignalementsBien(logementId: string) {
  const tickets = await prisma.ticketMaintenance.findMany({
    where:   { logementId },
    include: {
      locataire:   { select: { fullName: true, phone: true } },
      prestataire: { select: { nom: true, telephone: true } }
    },
    orderBy: { dateSignalement: "desc" }
  });
  return tickets.map(t => ({
    ...mapToSignalement(t),
    locataire:   t.locataire,
    prestataire: t.prestataire,
  }));
}

// Bailleur marque le signalement comme vu
export async function marquerSignalementVu(signalementId: string) {
  return prisma.ticketMaintenance.update({
    where: { id: signalementId },
    data: {
      proprioVuAt:       new Date(),
      statut:            "PRIS_EN_CHARGE",
      datePriseEnCharge: new Date()
    }
  });
}

// Bailleur met a jour le statut du signalement
export async function mettreAJourSignalement(signalementId: string, data: {
  statut:              string;
  commentaireProprio?: string;
  dateResolution?:     Date;
  prestataireId?:      string;
  devisMontant?:       number;
  coutFinal?:          number;
  dateIntervention?:   Date;
}) {
  return prisma.ticketMaintenance.update({
    where: { id: signalementId },
    data: {
      statut:             data.statut,
      commentaireProprio: data.commentaireProprio,
      dateResolution:     data.dateResolution,
      prestataireId:      data.prestataireId,
      devisMontant:       data.devisMontant,
      coutFinal:          data.coutFinal,
      dateIntervention:   data.dateIntervention,
      datePriseEnCharge:  data.statut === "PRIS_EN_CHARGE" ? new Date() : undefined,
      closedAt: ["RESOLU","CLOTURE"].includes(data.statut) ? new Date() : undefined,
    }
  });
}

// Locataire confirme resolution + note satisfaction
export async function confirmerSignalement(
  signalementId: string,
  estResolu:     boolean,
  note:          number  // 1 a 5 etoiles
) {
  return prisma.ticketMaintenance.update({
    where: { id: signalementId },
    data: {
      confirmationLoc:  estResolu,
      noteLocataire:    Math.min(5, Math.max(1, note)),
      dateConfirmation: new Date(),
      statut:           estResolu ? "RESOLU" : "CONTESTE",
      closedAt:         estResolu ? new Date() : undefined,
    }
  });
}

// Stats pour dashboard bailleur
export async function getStatsSignalements(landlordId: string) {
  const leases = await prisma.lease.findMany({
    where:  { landlordId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
    select: { id: true }
  });
  const ids = leases.map(l => l.id);
  const [enAttente, prisEnCharge, resolus] = await Promise.all([
    prisma.ticketMaintenance.count({ where:{leaseId:{in:ids},statut:"EN_ATTENTE"} }),
    prisma.ticketMaintenance.count({ where:{leaseId:{in:ids},statut:"PRIS_EN_CHARGE"} }),
    prisma.ticketMaintenance.count({ where:{leaseId:{in:ids},statut:{in:["RESOLU","CLOTURE"]}} }),
  ]);
  return { enAttente, prisEnCharge, resolus, total: enAttente + prisEnCharge + resolus };
}

// Fonction interne - mapping TicketMaintenance -> SignalementQapril
// Jamais exposee aux composants React
function mapToSignalement(t: any): SignalementQapril {
  return {
    id:               t.id,
    signalementRef:   t.ticketRef,   // SIG-XXXXX visible locataire
    categorie:        t.categorie,
    description:      t.description,
    urgence:          t.urgence,
    statut:           t.statut,
    dateSignalement:  t.dateSignalement,
    proprioVuAt:      t.proprioVuAt,
    datePriseEnCharge:t.datePriseEnCharge,
    dateResolution:   t.dateResolution,
    noteLocataire:    t.noteLocataire,
    confirmationLoc:  t.confirmationLoc,
    photoUrl:         t.photoUrl,
  };
}
