"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Temporary fallback for missing types during CI/Build
type ProspectStatut = any;
type CommType = any;

/**
 * M-CHAMPION-01 : Récupérer le profil complet d'un Champion
 */
export async function getChampionProfile(userId: string) {
  try {
    const profile = await (prisma as any).championProfile.findUnique({
      where: { userId },
      include: {
        prospects: {
          orderBy: { createdAt: "desc" },
          take: 50
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    return profile;
  } catch (error) {
    console.error("[M-CHAMPION] Fetch Profile Error:", error);
    return null;
  }
}

/**
 * M-CHAMPION-02 : Ajouter un prospect
 */
export async function addProspect(championId: string, data: {
  nom: string;
  telephone?: string;
  quartier?: string;
  nbLogementsEstime?: string;
  argumentCle?: string;
  note?: string;
}) {
  try {
    const prospect = await (prisma as any).championProspect.create({
      data: {
        championId,
        ...data,
        statut: "A_RAPPELER"
      }
    });

    revalidatePath("/dashboard/champion");
    return { success: true, prospectId: prospect.id };
  } catch (error) {
    return { success: false, error: "Erreur lors de l'ajout du prospect" };
  }
}

/**
 * M-CHAMPION-03 : Enregistrer une commission (Triggeré par un bail)
 */
export async function recordCommission(championId: string, type: CommType, amount: number, referenceId?: string) {
  try {
    const commission = await (prisma as any).championCommission.create({
      data: {
        championId,
        typeAction: type,
        montantFcfa: amount,
        referenceId,
        statut: "EN_ATTENTE"
      }
    });

    // Mise à jour du total dans le profil
    await (prisma as any).championProfile.update({
      where: { id: championId },
      data: {
        totalCommissionsFcfa: { increment: amount }
      }
    });

    return { success: true, commissionId: commission.id };
  } catch (error) {
    return { success: false, error: "Erreur lors de l'enregistrement de la commission" };
  }
}

/**
 * M-CHAMPION-04 : Leaderboard par zone
 */
export async function getLeaderboard(zone?: string) {
  try {
    const where = zone ? { zonePrincipale: zone } : {};
    
    const leaders = await (prisma as any).championProfile.findMany({
      where,
      orderBy: { totalCommissionsFcfa: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, fullName: true }
        }
      }
    });

    return leaders.map((l: any, idx: number) => ({
      rank: idx + 1,
      name: l.user.fullName || l.user.name || "Champion Anonyme",
      points: Number(l.totalCommissionsFcfa),
      zone: l.zonePrincipale
    }));
  } catch (error) {
    return [];
  }
}

/**
 * M-CHAMPION-05 : Marquer un prospect comme inscrit (Conversion)
 */
export async function convertProspect(prospectId: string, userIdInscrit: string) {
  try {
    await (prisma as any).championProspect.update({
      where: { id: prospectId },
      data: {
        statut: "INSCRIT",
        userIdInscrit
      }
    });

    revalidatePath("/dashboard/champion");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la conversion" };
  }
}

/**
 * M-CHAMPION-ADMIN : Récupérer tous les champions pour l'admin
 */
export async function getAllChampions() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return [];

    const champions = await (prisma as any).championProfile.findMany({
      include: {
        user: {
          select: { fullName: true, phone: true, email: true }
        },
        _count: {
          select: { prospects: true, commissions: true }
        }
      },
      orderBy: { totalCommissionsFcfa: "desc" }
    });

    return champions;
  } catch (error) {
    return [];
  }
}

/**
 * M-CHAMPION-ADMIN : Valider une commission
 */
export async function validateCommission(commissionId: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Non autorisé" };

    await (prisma as any).championCommission.update({
      where: { id: commissionId },
      data: {
        statut: "VALIDE",
        valideAt: new Date()
      }
    });

    revalidatePath("/admin/champions");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la validation" };
  }
}

/**
 * M-CHAMPION-ADMIN : Payer une commission
 */
export async function payCommission(commissionId: string, mode: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Non autorisé" };

    await (prisma as any).championCommission.update({
      where: { id: commissionId },
      data: {
        statut: "PAYE",
        payeAt: new Date(),
        modePaiement: mode
      }
    });

    revalidatePath("/admin/champions");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors du paiement" };
  }
}
