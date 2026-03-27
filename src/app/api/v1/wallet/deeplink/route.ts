import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateDeepLink } from "@/lib/wallet/deeplinks";

/**
 * [WDL-02] POST /api/v1/wallet/deeplink
 * Génère manuellement un lien de rechargement (ADD-07 v3).
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { amount, operator, reference } = await req.json();

    if (!amount || !operator) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const ref = reference || `MANUAL-${Date.now()}`;
    const url = await generateDeepLink(operator, amount, ref);

    // Enregistrer le lien dans le log de tracking
    const link = await prisma.walletRechargeLink.create({
        data: {
            userId: session.user.id,
            declencheur: "MANUEL",
            operateur: operator,
            montantSuggere: amount,
            soldeAuMoment: (session.user as any).walletBalance || 0,
            nbBailsActifs: 0, // Valeur par défaut pour génération manuelle
            urlGeneree: url,
            canalEnvoi: "WEB_UI",
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    });

    const baseUrl = process.env.NEXTAUTH_URL || "https://qapril.ci";
    const trackerUrl = `${baseUrl}/api/v1/wallet/deeplink/${link.id}/tracker`;

    return NextResponse.json({
        success: true,
        deeplink: url,
        trackerUrl: trackerUrl,
        linkId: link.id
    });

  } catch (error) {
    console.error("[WALLET_DEEPLINK_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
