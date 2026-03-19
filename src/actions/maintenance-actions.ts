"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaintenanceTicket(data: {
  logementId: string;
  leaseId?: string;
  declarantId: string;
  titre: string;
  description: string;
  photos?: string[];
}) {
  try {
    const ticket = await (prisma as any).ticketMaintenance.create({
      data: {
        ...data,
        photos: data.photos || [],
        statut: "SIGNALE",
      }
    });

    revalidatePath(`/dashboard/leases/${data.leaseId}`);
    return { success: true, ticket };
  } catch (error) {
    console.error("[MAINT] Create Error:", error);
    return { success: false, error: "Erreur lors du signalement de l'incident" };
  }
}

export async function updateTicketStatus(ticketId: string, statut: string, responseAgent?: string) {
  try {
    await (prisma as any).ticketMaintenance.update({
      where: { id: ticketId },
      data: { 
        statut,
        description: responseAgent ? { set: responseAgent } : undefined // On pourrait ajouter un champ de réponse
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getPropertyTickets(logementId: string) {
  try {
    return await (prisma as any).ticketMaintenance.findMany({
      where: { logementId },
      include: { declarant: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}
