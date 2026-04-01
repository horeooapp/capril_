"use server";
// QAPRIL — Signalements & Tickets Maintenance · ADD-11
// Modèle Prisma : TicketMaintenance

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Créer un signalement (par le locataire) ───────────────
export async function createSignalement(data: {
  leaseId:     string;
  locataireId: string;
  logementId?: string;
  categorie:   string;  // "FUITE_EAU"|"ELECTRICITE"|"PORTE_SERRURE"...
  description: string;
  urgence?:    string;  // "URGENTE"|"NORMALE"|"BASSE"
  photoUrl?:   string;
}) {
  const ref = `MAI-${Date.now().toString(36).toUpperCase()}`;
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
      dateSignalement: new Date()
    }
  });
  revalidatePath("/dashboard");
  return ticket;
}

// ── Signalements d'un locataire ──────────────────────────
export async function getSignalementsLocataire(locataireId: string) {
  return prisma.ticketMaintenance.findMany({
    where:   { locataireId },
    orderBy: { dateSignalement: "desc" }
  });
}

// ── Signalements d'un bien (pour bailleur) ───────────────
export async function getSignalementsForProperty(logementId: string) {
  return prisma.ticketMaintenance.findMany({
    where:   { logementId },
    include: { locataire: { select: { fullName: true, phone: true } } },
    orderBy: { dateSignalement: "desc" }
  });
}

// ── Mettre à jour le statut (bailleur/agent) ──────────────
export async function updateSignalementStatut(ticketId: string, data: {
  statut:             string;
  commentaireProprio?: string;
  dateResolution?:    Date;
}) {
  return prisma.ticketMaintenance.update({
    where: { id: ticketId },
    data: {
      statut:             data.statut,
      commentaireProprio: data.commentaireProprio,
      dateResolution:     data.dateResolution,
      datePriseEnCharge:  data.statut === "PRIS_EN_CHARGE" ? new Date() : undefined
    }
  });
}
