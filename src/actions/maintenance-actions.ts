import { MaintenanceService } from "@/lib/maintenance-service";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

/**
 * Créer un ticket de maintenance (MAI-01) - Updated for compatibility
 */
export async function createMaintenanceTicket(data: {
  leaseId?: string;
  logementId?: string;
  declarantId?: string;
  titre?: string;
  categorie?: any;
  description: string;
}) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;

  try {
    let leaseId = data.leaseId;
    if (!leaseId && data.logementId) {
      const activeLease = await (prisma as any).lease.findFirst({
        where: { propertyId: data.logementId, status: "ACTIVE" },
      });
      leaseId = activeLease?.id;
    }

    if (!leaseId) throw new Error("Aucun bail actif trouvé pour ce logement.");

    const ticket = await MaintenanceService.creerTicket({
      leaseId,
      locataireId: data.declarantId || userId,
      categorie: data.categorie || "MAI_AU",
      description: data.description,
    });

    revalidatePath("/dashboard/maintenance");
    return { success: true, ticketId: ticket.id, ticketRef: ticket.ticketRef };
  } catch (error: any) {
    console.error("Erreur createMaintenanceTicket:", error);
    return { error: error.message || "Erreur lors de la création du ticket." };
  }
}

/**
 * Récupérer tous les tickets (compatibilité admin)
 */
export async function getPropertyTickets(propertyId: string | "all") {
  await ensureAuthenticated();
  
  const where = propertyId === "all" ? {} : { logementId: propertyId };
  
  const tickets = await (prisma as any).ticketMaintenance.findMany({
    where,
    include: {
      locataire: { select: { fullName: true } },
      logement: { select: { address: true } },
    },
    orderBy: { createdAt: "desc" }
  });

  return tickets.map((t: any) => ({
    id: t.id,
    titre: t.description.substring(0, 30) + "...",
    description: t.description,
    statut: mapStatusToLegacy(t.statut),
    createdAt: t.createdAt,
    declarant: { fullName: t.locataire?.fullName || "Anonyme" },
    logement: { address: t.logement?.address || "N/A" }
  }));
}

function mapStatusToLegacy(status: string): string {
  switch (status) {
    case "EN_ATTENTE": return "SIGNALE";
    case "PRIS_EN_CHARGE": return "TRAVAUX_EN_COURS";
    case "RÉSOLU": return "RESOLU";
    default: return status;
  }
}

function mapStatusFromLegacy(status: string): string {
  switch (status) {
    case "SIGNALE": return "EN_ATTENTE";
    case "TRAVAUX_EN_COURS": return "PRIS_EN_CHARGE";
    case "RESOLU": return "RÉSOLU";
    default: return "EN_ATTENTE";
  }
}

/**
 * Mettre à jour le statut (compatibilité legacy)
 */
export async function updateTicketStatus(id: string, newStatut: string) {
  await ensureAuthenticated();
  try {
    const status = mapStatusFromLegacy(newStatut);
    await (prisma as any).ticketMaintenance.update({
      where: { id },
      data: { statut: status }
    });
    revalidatePath("/dashboard/maintenance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function takeMaintenanceTicket(ticketId: string, commentaire?: string) {
    return updateTicketStatus(ticketId, "TRAVAUX_EN_COURS");
}

export async function resolveMaintenanceTicket(ticketId: string, commentaire?: string) {
    return updateTicketStatus(ticketId, "RESOLU");
}

export async function confirmMaintenanceResolution(ticketId: string, confirme: boolean) {
    return updateTicketStatus(ticketId, confirme ? "CLÔTURÉ" : "CONTESTÉ");
}
