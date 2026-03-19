"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitCandidature(data: {
  logementId: string;
  candidatId?: string;
  revenuMensuel: number;
  profession: string;
  documentsUrls: string[];
}) {
  try {
    const candidature = await (prisma as any).candidature.create({
      data: {
        logementId: data.logementId,
        candidatId: data.candidatId,
        revenuMensuel: data.revenuMensuel,
        profession: data.profession,
        documentsUrls: data.documentsUrls,
        statut: "EN_COURS",
      }
    });

    return { success: true, candidatureId: candidature.id };
  } catch (error) {
    console.error("[CAND] Submit Error:", error);
    return { success: false, error: "Erreur lors du dépôt de candidature" };
  }
}

export async function updateCandidatureStatus(id: string, statut: string, scoreInternal?: number) {
  try {
    await (prisma as any).candidature.update({
      where: { id },
      data: { statut, scoreInternal }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getPropertyCandidatures(logementId: string) {
  try {
    return await (prisma as any).candidature.findMany({
      where: { logementId },
      include: { candidat: true },
      orderBy: { scoreInternal: "desc" }
    });
  } catch (error) {
    return [];
  }
}
