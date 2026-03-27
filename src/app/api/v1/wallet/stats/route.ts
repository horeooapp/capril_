import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * [WDL-08] GET /api/v1/wallet/stats
 * Statistiques de conversion des liens de recharge (Admin uniquement).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Statistiques globales par déclencheur
    const stats = await prisma.walletRechargeLink.groupBy({
      by: ['declencheur'],
      _count: {
        _all: true,
      },
      _sum: {
        clicsCompteur: true,
        montantSuggere: true
      }
    });

    // Taux de conversion (Nombre de clics > 0 / Total)
    const convertedLinks = await prisma.walletRechargeLink.count({
        where: { clicsCompteur: { gt: 0 } }
    });
    const totalLinks = await prisma.walletRechargeLink.count();

    return NextResponse.json({
        byTrigger: stats,
        overall: {
            total: totalLinks,
            clicked: convertedLinks,
            conversionRate: totalLinks > 0 ? (convertedLinks / totalLinks) * 100 : 0
        }
    });

  } catch (error) {
    console.error("[WALLET_STATS_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
