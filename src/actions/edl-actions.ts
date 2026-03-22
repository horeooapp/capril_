"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * EDL-01 : Initier un état des lieux (Entrée ou Sortie)
 */
export async function createEdl(data: {
  leaseId: string;
  typeEdl: "ENTREE" | "SORTIE";
  indexEau?: number;
  indexElec?: number;
  clesRemises?: number;
  clesDetail?: string;
  sections: any[]; // JSON structure from UI
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  try {
    // Génération de la référence : EDL-2026-XXXXX
    const year = new Date().getFullYear();
    const count = await prisma.etatsDesLieux.count();
    const refEdl = `EDL-${year}-${(count + 1).toString().padStart(5, '0')}`;

    const edl = await prisma.etatsDesLieux.create({
      data: {
        leaseId: data.leaseId,
        typeEdl: data.typeEdl,
        statut: "EN_COURS",
        redigeParId: session.user.id,
        refEdl,
        sections: data.sections || [],
        indexEau: data.indexEau,
        indexElec: data.indexElec,
        clesRemises: data.clesRemises || 0,
        clesDetail: data.clesDetail,
      }
    });

    revalidatePath(`/dashboard/leases/${data.leaseId}`);
    return { success: true, edlId: edl.id, refEdl, edl };
  } catch (error) {
    console.error("[EDL] Create Error:", error);
    return { success: false, error: "Erreur lors de la création de l'EDL" };
  }
}

/**
 * EDL-03 : Soumettre au locataire pour confirmation
 */
export async function submitEdlToTenant(edlId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  try {
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 48);

    const edl = await prisma.etatsDesLieux.update({
      where: { id: edlId },
      data: {
        statut: "SOUMIS_LOCATAIRE",
        confirmeProprio: true,
        confirmeProprioAt: new Date(),
        expireConfirmationAt: expireAt,
      }
    });

    // TODO: Déclencher notification WhatsApp/Email (ADD-09)
    
    revalidatePath(`/dashboard/edl/${edlId}`);
    revalidatePath(`/dashboard/leases/${edl.leaseId}`);
    return { success: true, expireAt };
  } catch (error) {
    return { success: false, error: "Erreur lors de la soumission" };
  }
}

/**
 * EDL-04 : Confirmation ou réserves du locataire
 */
export async function confirmEdlByTenant(edlId: string, confirm: boolean, reserves?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  try {
    const status = confirm ? "CONFIRME" : "CONTESTE";
    
    let updateData: any = {
      statut: status,
      confirmeLocataire: confirm,
      confirmeLocataireAt: new Date(),
      reservesLocataire: reserves,
    };

    // Si confirmé, on certifie (SHA-256)
    if (confirm) {
      updateData.statut = "CERTIFIE";
      const edl = await prisma.etatsDesLieux.findUnique({ where: { id: edlId } });
      const contentToHash = JSON.stringify(edl?.sections) + edl?.refEdl;
      const hash = require('crypto').createHash('sha256').update(contentToHash).digest('hex');
      updateData.hashSha256 = hash;
    }

    const edl = await prisma.etatsDesLieux.update({
      where: { id: edlId },
      data: updateData
    });

    revalidatePath(`/dashboard/leases/${edl.leaseId}`);
    return { success: true, statut: edl.statut, hash: edl.hashSha256 };
  } catch (error) {
    return { success: false, error: "Erreur lors de la réponse" };
  }
}

/**
 * EDL-05 : Comparaison Entrée/Sortie
 */
export async function getEdlComparison(leaseId: string) {
  try {
    const edls = await prisma.etatsDesLieux.findMany({
      where: { leaseId },
      orderBy: { createdAt: "asc" }
    });

    const entree = edls.find(e => e.typeEdl === "ENTREE");
    const sortie = edls.find(e => e.typeEdl === "SORTIE");

    return { entree, sortie };
  } catch (error) {
    return { error: "Erreur de récupération des données de comparaison" };
  }
}

export async function getEdlsByLease(leaseId: string) {
  try {
    return await prisma.etatsDesLieux.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("[EDL] Fetch Error:", error);
    return [];
  }
}
