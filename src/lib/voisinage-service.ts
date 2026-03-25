import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";

export class VoisinageService {
  /**
   * Publie une annonce (VOI-01)
   */
  static async publierAnnonce(data: {
    proprioId: string;
    propertyId: string; // building/courtyard reference
    titre: string;
    contenu: string;
    typeAnnonce: string;
    destinataires: string;
    photoUrl?: string;
    photoHashSha256?: string;
    dateExpiration?: Date;
    epingle?: boolean;
  }) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      include: {
        leases: {
          where: { status: "ACTIVE" },
          select: { tenantId: true },
        },
      },
    });

    if (!property) throw new Error("Propriété non trouvée");

    const annonce = await (prisma as any).annonceVoisinage.create({
      data: {
        proprioId: data.proprioId,
        propertyId: data.propertyId,
        titre: data.titre,
        contenu: data.contenu,
        typeAnnonce: data.typeAnnonce,
        destinataires: data.destinataires,
        photoUrl: data.photoUrl,
        photoHashSha256: data.photoHashSha256,
        dateExpiration: data.dateExpiration,
        epingle: data.epingle || false,
      },
    });

    // Notification aux locataires actifs de la cour
    const locatairesIds = (property.leases as any[])
      .map((l: any) => l.tenantId as string)
      .filter((id: string | null): id is string => !!id);

    for (const userId of locatairesIds) {
      await NotificationService.envoyerNotification(
        userId,
        "ANNONCE_VOISINAGE",
        {
          payload: {
            titre: `Annonce Voisinage: ${annonce.titre}`,
            message: annonce.contenu.substring(0, 50) + "...",
            annonceId: annonce.id
          }
        }
      );
    }

    return annonce;
  }

  /**
   * Epingler une annonce (VOI-04)
   */
  static async epinglerAnnonce(annonceId: string, epingle: boolean) {
    return await (prisma as any).annonceVoisinage.update({
      where: { id: annonceId },
      data: { epingle },
    });
  }

  /**
   * Supprime une annonce (VOI-02)
   */
  static async supprimerAnnonce(annonceId: string, userId: string) {
    const annonce = await (prisma as any).annonceVoisinage.findUnique({
      where: { id: annonceId },
    });

    if (annonce?.proprioId !== userId) {
      throw new Error("Action non autorisée");
    }

    return await (prisma as any).annonceVoisinage.delete({
      where: { id: annonceId },
    });
  }

  /**
   * Liste les annonces d'une cour (VOO-03)
   */
  static async getAnnoncesCour(propertyId: string) {
    return await (prisma as any).annonceVoisinage.findMany({
      where: { propertyId },
      orderBy: { datePublication: "desc" },
    });
  }
}
