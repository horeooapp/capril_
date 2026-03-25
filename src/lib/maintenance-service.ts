import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { MaintenanceCategory, MaintenanceStatus } from "@prisma/client";

export class MaintenanceService {
  /**
   * Crée un nouveau ticket de maintenance (MAI-01)
   */
  static async creerTicket(data: {
    leaseId: string;
    locataireId: string;
    categorie: MaintenanceCategory;
    description: string;
    photoUrl?: string;
    photoHashSha256?: string;
    urgence?: string;
  }) {
    // Génération de la référence MAI-XXXX
    const count = await prisma.ticketMaintenance.count();
    const ticketRef = `MAI-${(count + 1).toString().padStart(4, "0")}`;

    const ticket = await prisma.ticketMaintenance.create({
      data: {
        ticketRef,
        leaseId: data.leaseId,
        locataireId: data.locataireId,
        categorie: data.categorie,
        description: data.description,
        photoUrl: data.photoUrl,
        photoHashSha256: data.photoHashSha256,
        urgence: data.urgence || "NORMALE",
        statut: "EN_ATTENTE",
      },
      include: {
        lease: {
          include: {
            landlord: true,
            property: true,
          },
        },
        locataire: true,
      },
    }) as any; // Temporary cast to bypass stale linting if any

    // Notification au propriétaire/gestionnaire
    await NotificationService.envoyerNotification(
      ticket.lease.landlordId,
      "TICKET_MAINTENANCE_CREE",
      {
        payload: {
          titre: "Nouveau ticket de maintenance",
          message: `Un nouveau ticket (${ticket.ticketRef}) a été créé pour le logement ${ticket.lease.property.propertyCode} par ${ticket.locataire.fullName}.`,
          ticketId: ticket.id,
          ticketRef: ticket.ticketRef
        }
      }
    );

    return ticket;
  }

  /**
   * Prise en charge du ticket par le propriétaire (MAI-02)
   */
  static async prendreEnCharge(ticketId: string, commentaire?: string) {
    const ticket = await prisma.ticketMaintenance.update({
      where: { id: ticketId },
      data: {
        statut: "PRIS_EN_CHARGE",
        datePriseEnCharge: new Date(),
        commentaireProprio: commentaire,
      },
      include: {
        locataire: true,
      },
    }) as any;

    await NotificationService.envoyerNotification(
      ticket.locataireId,
      "TICKET_MAINTENANCE_MAJ",
      {
        payload: {
          titre: "Ticket pris en charge",
          message: `Votre ticket ${ticket.ticketRef} est désormais pris en charge.`,
          ticketId: ticket.id,
          statut: ticket.statut
        }
      }
    );

    return ticket;
  }

  /**
   * Résolution du ticket (MAI-03)
   */
  static async resoudreTicket(ticketId: string, commentaire?: string) {
    const ticket = await prisma.ticketMaintenance.update({
      where: { id: ticketId },
      data: {
        statut: "RÉSOLU",
        dateResolution: new Date(),
        commentaireProprio: commentaire,
      },
      include: {
        locataire: true,
      },
    }) as any;

    await NotificationService.envoyerNotification(
      ticket.locataireId,
      "TICKET_MAINTENANCE_RESOLU",
      {
        payload: {
          titre: "Travaux terminés",
          message: `Le propriétaire a marqué le ticket ${ticket.ticketRef} comme résolu. Merci de confirmer la fin des travaux dans l'application.`,
          ticketId: ticket.id
        }
      }
    );

    return ticket;
  }

  /**
   * Confirmation ou contestation par le locataire (MAI-04)
   */
  static async confirmerResolution(ticketId: string, confirme: boolean) {
    const ticket = await prisma.ticketMaintenance.update({
      where: { id: ticketId },
      data: {
        confirmationLoc: confirme,
        dateConfirmation: new Date(),
        statut: confirme ? "CLÔTURÉ" : "CONTESTÉ",
        nbReouvertures: confirme ? undefined : { increment: 1 },
      },
      include: {
        lease: {
          include: {
            landlord: true,
          },
        },
      },
    }) as any;

    await NotificationService.envoyerNotification(
      ticket.lease.landlordId,
      "TICKET_MAINTENANCE_CONFIRME",
      {
        payload: {
          titre: confirme ? "Ticket clôturé" : "Résolution contestée",
          message: confirme 
            ? `Le locataire a confirmé la résolution du ticket ${ticket.ticketRef}.`
            : `Le locataire a contesté la résolution du ticket ${ticket.ticketRef}.`,
          ticketId: ticket.id,
          confirme
        }
      }
    );

    return ticket;
  }

  /**
   * Réouverture du ticket (RMM-01)
   */
  static async reouvrirTicket(ticketId: string) {
    return await prisma.ticketMaintenance.update({
      where: { id: ticketId },
      data: {
        statut: "EN_ATTENTE",
        dateResolution: null,
        confirmationLoc: null,
        nbReouvertures: { increment: 1 },
      },
    });
  }
}
