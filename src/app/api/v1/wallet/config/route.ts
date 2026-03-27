import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * [WDL-01] GET /api/v1/wallet/config
 * Récupère les paramètres globaux du wallet (ADD-07 v3).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const configs = await prisma.configTarif.findMany({
      where: {
        cle: { startsWith: "wallet_" }
      }
    });

    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.cle] = curr.metadata || curr.valeur;
      return acc;
    }, {});

    return NextResponse.json(configMap);
  } catch (error) {
    console.error("[WALLET_CONFIG_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
