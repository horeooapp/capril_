"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EdlPiece, EdlMeter, EdlEquipment } from "@/lib/edl";

export async function createEdl(data: {
  leaseId: string;
  typeEdl: "ENTREE" | "SORTIE" | "INVENTAIRE";
  agentId?: string;
  locataireId?: string;
  pieces: EdlPiece[];
  compteurs?: EdlMeter[];
  equipements?: EdlEquipment[];
}) {
  try {
    const edl = await (prisma as any).etatsDesLieux.create({
      data: {
        leaseId: data.leaseId,
        typeEdl: data.typeEdl,
        agentId: data.agentId,
        locataireId: data.locataireId,
        pieces: data.pieces,
        compteurs: data.compteurs || [],
        equipements: data.equipements || [],
        statut: "EN_COURS",
      }
    });

    revalidatePath(`/dashboard/leases/${data.leaseId}`);
    return { success: true, edl };
  } catch (error) {
    console.error("[EDL] Create Error:", error);
    return { success: false, error: "Erreur lors de la création de l'EDL" };
  }
}

export async function updateEdl(id: string, data: Partial<{
  pieces: EdlPiece[];
  compteurs: EdlMeter[];
  equipements: EdlEquipment[];
  statut: string;
}>) {
  try {
    const edl = await (prisma as any).etatsDesLieux.update({
      where: { id },
      data
    });

    return { success: true, edl };
  } catch (error) {
    console.error("[EDL] Update Error:", error);
    return { success: false, error: "Erreur lors de la mise à jour de l'EDL" };
  }
}

export async function getEdlsByLease(leaseId: string) {
  try {
    return await (prisma as any).etatsDesLieux.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("[EDL] Fetch Error:", error);
    return [];
  }
}
