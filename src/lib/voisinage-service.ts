import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";

export class VoisinageService {
  /**
   * Publie une annonce à la "cour" (VOI-01)
   */
  static async publierAnnonce(data: {
    proprioId: string;
    propertyId: string;
    titre: string;
    contenu: string;
    typeAnnonce: "ANNONCE" | "PLANNING" | "ALERTE_COUPURE" | "REGLEMENT" | "ECHANGE_TOUR";
    destinataires?: string; // "TOUS" or id locataire
    dateExpiration?: Date;
    epingle?: boolean;
  }) {
    const annonce = await prisma.annonceVoisinage.create({
      data: {
        proprioId: data.proprioId,
        propertyId: data.propertyId,
        titre: data.titre,
        contenu: data.contenu,
        typeAnnonce: data.typeAnnonce,
        destinataires: data.destinataires || "TOUS",
        dateExpiration: data.dateExpiration,
        epingle: data.epingle || false,
      },
      include: {
        property: {
          include: {
            leasesAsProperty: {
              where: { status: "ACTIVE" },
              select: { tenantId: true },
            },
          },
        },
      },
    });

    // Notification à tous les locataires actifs de la propriété
    const tenantIds = annonce.property.leasesAsProperty
      .map((l) => l.tenantId)
      .filter((id): id is string => !!id);

    if (tenantIds.length > 0) {
      await Promise.all(
        tenantIds.map((userId) =>
          NotificationService.envoyerNotification({
            userId,
            type: "ANNONCE_VOISINAGE",
            titre: `Nouvelle annonce : ${annonce.titre}`,
            message: annonce.contenu.substring(0, 100),
            data: { propertyId: data.propertyId, annonceId: annonce.id },
            channels: ["PUSH"],
          })
        )
      );
    }

    return annonce;
  }

  /**
   * Récupère les annonces actives d'une propriété (VOI-02)
   */
  static async getAnnoncesCour(propertyId: string) {
    return await prisma.annonceVoisinage.findMany({
      where: {
        propertyId,
        OR: [
          { dateExpiration: null },
          { dateExpiration: { gt: new Date() } },
        ],
      },
      orderBy: [
        { epingle: "desc" },
        { datePublication: "desc" },
      ],
      include: {
        proprio: {
          select: { fullName: true },
        },
      },
    });
  }

  /**
   * Epingle ou désépingle une annonce (VOI-04)
   */
  static async epinglerAnnonce(annonceId: string, epingle: boolean) {
    return await prisma.annonceVoisinage.update({
      where: { id: annonceId },
      data: { epingle },
    });
  }

  /**
   * Action d'archivage (manuel ou automatique via date expirée)
   */
  static async archiverAnnonce(annonceId: string) {
    return await prisma.annonceVoisinage.update({
      where: { id: annonceId },
      data: { dateExpiration: new Date() },
    });
  }
}
