"use server"

import { MaintenanceService } from "@/lib/maintenance-service";
import { MaintenanceCategory, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";

/**
 * Créer un ticket de maintenance (MAI-01)
 */
export async function createMaintenanceTicket(data: {
  leaseId: string;
  categorie: MaintenanceCategory;
  description: string;
  photoUrl?: string;
  photoHashSha256?: string;
  urgence?: string;
}) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;

  try {
    // Vérification accès (Locataire ou Proprio/Agence)
    await ensureLeaseAccess(data.leaseId);

    const ticket = await MaintenanceService.creerTicket({
      ...data,
      locataireId: userId,
    });

    revalidatePath("/dashboard/maintenance");

    await writeAuditLog({
      userId,
      action: "MAINTENANCE_TICKET_CREATED",
      module: "MAINTENANCE",
      entityId: ticket.id,
      newValues: { ref: ticket.ticketRef, cat: data.categorie }
    });

    return { success: true, ticketId: ticket.id, ticketRef: ticket.ticketRef };
  } catch (error: any) {
    console.error("Erreur createMaintenanceTicket:", error);
    return { error: error.message || "Erreur lors de la création du ticket." };
  }
}

/**
 * Prendre en charge un ticket (MAI-02)
 */
export async function takeMaintenanceTicket(ticketId: string, commentaire?: string) {
  const session = await ensureAuthenticated();
  
  try {
    const ticket = await MaintenanceService.prendreEnCharge(ticketId, commentaire);

    revalidatePath("/dashboard/maintenance");

    await writeAuditLog({
      userId: session.user.id,
      action: "MAINTENANCE_TICKET_TAKEN",
      module: "MAINTENANCE",
      entityId: ticketId,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Résoudre un ticket (MAI-03)
 */
export async function resolveMaintenanceTicket(ticketId: string, commentaire?: string) {
  const session = await ensureAuthenticated();
  
  try {
    await MaintenanceService.resoudreTicket(ticketId, commentaire);
    revalidatePath("/dashboard/maintenance");

    await writeAuditLog({
      userId: session.user.id,
      action: "MAINTENANCE_TICKET_RESOLVED",
      module: "MAINTENANCE",
      entityId: ticketId,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Confirmer ou contester la résolution (MAI-04)
 */
export async function confirmMaintenanceResolution(ticketId: string, confirme: boolean) {
  const session = await ensureAuthenticated();
  
  try {
    await MaintenanceService.confirmerResolution(ticketId, confirme);
    revalidatePath("/dashboard/maintenance");

    await writeAuditLog({
      userId: session.user.id,
      action: confirme ? "MAINTENANCE_TICKET_CLOSED" : "MAINTENANCE_TICKET_CONTESTED",
      module: "MAINTENANCE",
      entityId: ticketId,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
