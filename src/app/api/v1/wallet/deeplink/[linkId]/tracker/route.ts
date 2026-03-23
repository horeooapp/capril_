import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;

  try {
    const link = await prisma.walletRechargeLink.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    // 1. Marquer comme cliqué
    await prisma.walletRechargeLink.update({
      where: { id: linkId },
      data: {
        clique: true,
        cliqueAt: new Date()
      }
    });

    // 2. Rediriger vers l'URL générée
    return NextResponse.redirect(link.urlGeneree);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
