"use server"

import { VoisinageService } from "@/lib/voisinage-service";
import { revalidatePath } from "next/cache";
import { ensureAuthenticated, ensurePropertyAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";

/**
 * Publier une annonce (VOI-01)
 */
export async function publishVoisinageAnnonce(data: {
  propertyId: string;
  titre: string;
  contenu: string;
  typeAnnonce: "ANNONCE" | "PLANNING" | "ALERTE_COUPURE" | "REGLEMENT" | "ECHANGE_TOUR";
  destinataires?: string;
  dateExpiration?: Date;
  epingle?: boolean;
}) {
  const session = await ensureAuthenticated();
  const userId = session.user.id;

  try {
    // Vérification accès proprio/agence à la propriété
    await ensurePropertyAccess(data.propertyId);

    const annonce = await VoisinageService.publierAnnonce({
      ...data,
      destinataires: data.destinataires || "TOUS",
      proprioId: userId,
    });

    revalidatePath(`/dashboard/courtyard/${data.propertyId}`);

    await writeAuditLog({
      userId,
      action: "VOISINAGE_ANNONCE_PUBLISHED",
      module: "VOISINAGE",
      entityId: annonce.id,
      newValues: { titre: data.titre }
    });

    return { success: true, annonceId: annonce.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Epingler une annonce (VOI-04)
 */
export async function pinVoisinageAnnonce(annonceId: string, propertyId: string, epingle: boolean) {
  const session = await ensureAuthenticated();
  
  try {
    await ensurePropertyAccess(propertyId);
    await VoisinageService.epinglerAnnonce(annonceId, epingle);
    revalidatePath(`/dashboard/courtyard/${propertyId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
