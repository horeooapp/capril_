import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { AnnonceVoisinage } from "@prisma/client";

export class VoisinageService {
  /**
   * Publie une annonce (VOI-01)
   */
  static async publierAnnonce(data: {
    proprioId: string;
    logementId: string; // Property ID for the courtyard
    titre: string;
    contenu: string;
    typeAnnonce: string;
    destinataires: "COUR_COMMUNE" | "TOUS";
    photoUrl?: string;
    photoHashSha256?: string;
  }) {
    // Vérification de l'existence de la propriété
    const property = await prisma.property.findUnique({
      where: { id: data.logementId },
      include: {
        leases: {
          where: { status: "ACTIVE" },
          select: { tenantId: true },
        },
      },
    });

    if (!property) throw new Error("Propriété non trouvée");

    const annonce = await prisma.annonceVoisinage.create({
      data: {
        proprioId: data.proprioId,
        logementId: data.logementId,
        titre: data.titre,
        contenu: data.contenu,
        typeAnnonce: data.typeAnnonce,
        destinataires: data.destinataires,
        photoUrl: data.photoUrl,
        photoHashSha256: data.photoHashSha256,
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
   * Liste les annonces d'une cour (VOI-03)
   */
  static async getAnnoncesCour(logementId: string) {
    return await (prisma as any).annonceVoisinage.findMany({
      where: { logementId },
      orderBy: { datePublication: "desc" },
    });
  }
}
