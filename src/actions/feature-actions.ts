"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateFeaturesCache } from "@/lib/features";
import { auth } from "@/auth";

/**
 * FEAT-01 : Toggle un module (Activer/Désactiver)
 */
export async function toggleFeature(id: string, enabled: boolean) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      throw new Error("Accès refusé");
    }

    if (!(prisma as any).featureFlag) {
      throw new Error("Le système de modules n'est pas encore initialisé sur ce serveur (table manquante).");
    }

    await (prisma as any).featureFlag.update({
      where: { id },
      data: { enabled },
    });

    // Invalider le cache pour que le changement soit immédiat
    invalidateFeaturesCache();
    
    revalidatePath("/admin/settings/features");
    
    return { success: true };
  } catch (error: any) {
    console.error("[Features Action] Erreur :", error);
    return { success: false, error: error.message };
  }
}
