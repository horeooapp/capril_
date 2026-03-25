import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";

export class MessagingService {
  /**
   * Envoie un message sécurisé (MSG-01)
   */
  static async envoyerMessage(data: {
    leaseId: string;
    expediteurId: string;
    roleExpediteur: "PROPRIO" | "LOCATAIRE" | "SYSTEME";
    contenu: string;
    pjUrl?: string;
    pjHashSha256?: string;
  }) {
    const message = await (prisma as any).messagerieBail.create({
      data: {
        leaseId: data.leaseId,
        expediteurId: data.expediteurId,
        roleExpediteur: data.roleExpediteur,
        contenu: data.contenu,
        pjUrl: data.pjUrl,
        pjHashSha256: data.pjHashSha256,
        statut: "ENVOYÉ",
      },
      include: {
        lease: {
          include: {
            landlord: true,
            tenant: true,
          },
        },
        expediteur: true,
      },
    });

    const destinataireId = data.roleExpediteur === "PROPRIO" 
      ? message.lease.tenantId 
      : message.lease.landlordId;

    if (destinataireId) {
      await NotificationService.envoyerNotification(
        destinataireId,
        "NOUVEAU_MESSAGE_BAIL",
        {
          payload: {
            titre: `Nouveau message de ${message.expediteur.fullName}`,
            message: data.contenu.substring(0, 50) + (data.contenu.length > 50 ? "..." : ""),
            leaseId: data.leaseId,
            msgId: message.id
          }
        }
      );
    }

    return message;
  }

  /**
   * Marquer un message comme lu (MSG-02)
   */
  static async marquerCommeLu(msgId: string) {
    return await (prisma as any).messagerieBail.update({
      where: { id: msgId },
      data: {
        statut: "LU",
        dateLecture: new Date(),
      },
    });
  }

  /**
   * Récupérer la discussion pour un bail (MSG-03)
   */
  static async getFilDiscussion(leaseId: string) {
    return await (prisma as any).messagerieBail.findMany({
      where: { leaseId },
      orderBy: { dateEnvoi: "asc" },
      include: {
        expediteur: {
          select: {
            fullName: true,
            role: true,
          },
        },
      },
    });
  }
}
