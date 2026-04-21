import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { MaintenanceService } from "./maintenance-service";
import { addHours } from "date-fns";

export class RclService {
  /**
   * [P3.1] Create a new reclamation ticket with 144h countdown.
   */
  static async createTicket(data: {
    leaseId: string;
    tenantId: string;
    typeReclamation: string;
    description: string;
    preuveUrl?: string;
  }) {
    const expirationDate = addHours(new Date(), 144);

    const ticket = await prisma.reclamationLocataire.create({
      data: {
        ...data,
        statut: "OUVERT",
        dateEcheance: expirationDate,
      },
      include: {
        lease: {
          include: {
            property: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    // Handle Maintenance Link (RCL-05)
    if (data.typeReclamation === "RCL-05") {
      await MaintenanceService.creerTicket({
        leaseId: data.leaseId,
        locataireId: data.tenantId,
        categorie: "MAI_AU", // Autre (MAI_AU)
        description: `[RCL-05] ${data.description}`,
        photoUrl: data.preuveUrl,
        urgence: "NORMALE"
      });
    }

    // Notify Bailleur/Manager (WA + SMS as per rule)
    await NotificationService.envoyerNotification(
      ticket.lease.property.ownerUserId,
      "RECLAMATION_RECUE",
      {
        payload: {
          ticketId: ticket.id,
          type: data.typeReclamation,
          delai: "144h",
          bien: ticket.lease.property.name,
        }
      }
    );

    return ticket;
  }

  /**
   * [P3.1] Process expired tickets (Rule RCL-144h).
   * Automatically close in favor of tenant and sanction landlord score.
   */
  static async processExpirations() {
    const now = new Date();

    const expiredTickets = await prisma.reclamationLocataire.findMany({
      where: {
        statut: "OUVERT",
        dateEcheance: { lte: now },
      },
      include: {
        lease: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    const results = [];

    for (const ticket of expiredTickets) {
      // 1. Close ticket automatically
      await prisma.reclamationLocataire.update({
        where: { id: ticket.id },
        data: { statut: "RESOLU_AUTO_EXPIRATION" },
      });

      // 2. Sanction landlord/manager score (-2 pts)
      // We'll create a malus event in scoring history
      await prisma.iclEvent.create({
        data: {
          userId: ticket.lease.property.ownerUserId,
          type: "SANCTION_RCL_SILENCE",
          points: -2,
          description: `Sanction pour absence de réponse au ticket ${ticket.id} après 144h.`,
        },
      });

      // 3. Notify both parties
      // Tenant: Good news
      await NotificationService.envoyerNotification(
        ticket.tenantId,
        "RCL_RESOLU_AUTO",
        { payload: { ticketId: ticket.id } }
      );

      // Landlord: Sanction notice
      await NotificationService.envoyerNotification(
        ticket.lease.property.ownerUserId,
        "SANCTION_APPLIQUEE",
        { payload: { ticketId: ticket.id, motif: "Silence 144h", points: -2 } }
      );

      results.push(ticket.id);
    }

    return results;
  }
}
