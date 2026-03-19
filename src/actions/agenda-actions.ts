"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AgendaType = 
  | 'VISITE' 
  | 'EDL_ENTREE' 
  | 'EDL_SORTIE' 
  | 'REMISE_CLES' 
  | 'REUNION_PROPRIO' 
  | 'TRAVAUX' 
  | 'ECHEANCE_BAIL' 
  | 'AUTRE';

export async function createEvent(data: {
  agenceId: string;
  agentId?: string;
  typeEvent: AgendaType;
  titre: string;
  description?: string;
  contactId?: string;
  logementId?: string;
  leaseId?: string;
  debutAt: Date;
  finAt?: Date;
  rappelMinutes?: number;
}) {
  try {
    const event = await (prisma as any).agendaEvenement.create({
      data: {
        ...data,
        statut: "PLANIFIE"
      }
    });

    revalidatePath("/admin/agenda");
    return { success: true, event };
  } catch (error) {
    console.error("[Agenda] Create Error:", error);
    return { success: false, error: "Erreur lors de la création de l'événement" };
  }
}

export async function getAgencyEvents(agenceId: string, start: Date, end: Date) {
  try {
    return await (prisma as any).agendaEvenement.findMany({
      where: {
        agenceId,
        debutAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        contact: true,
        logement: true,
        agent: true
      },
      orderBy: { debutAt: "asc" }
    });
  } catch (error) {
    console.error("[Agenda] Fetch Error:", error);
    return [];
  }
}

export async function updateEventStatus(eventId: string, statut: string) {
  try {
    await (prisma as any).agendaEvenement.update({
      where: { id: eventId },
      data: { statut }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
