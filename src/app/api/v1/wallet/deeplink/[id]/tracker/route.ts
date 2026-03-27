import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * [WDL-07] GET /api/v1/wallet/deeplink/[id]/tracker
 * Redirige l'utilisateur vers son app de paiement tout en comptabilisant le clic.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const link = await prisma.walletRechargeLink.findUnique({
      where: { id }
    });

    if (!link) {
      return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
    }

    // 1. Incrémenter le compteur de clics (Tracking conversion)
    await prisma.walletRechargeLink.update({
      where: { id },
      data: {
        clicsCompteur: { increment: 1 },
        cliqueAt: new Date()
      }
    });

    // 2. Redirection vers l'URL générée (Wave/OM/MTN deep link)
    return NextResponse.redirect(link.urlGeneree);

  } catch (error) {
    console.error("[WALLET_TRACKER_ERROR]", error);
    return new Response("Erreur de redirection", { status: 500 });
  }
}
