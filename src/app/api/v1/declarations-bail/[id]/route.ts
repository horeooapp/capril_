import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-04
 * Annuler une déclaration de bail en attente
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: declarationId } = await params;
    const userId = session.user.id;

    const declaration = await prisma.declarationBail.findUnique({
      where: { id: declarationId }
    });

    if (!declaration) {
      return NextResponse.json({ error: "Déclaration introuvable" }, { status: 404 });
    }

    if (declaration.initiateurId !== userId) {
      return NextResponse.json({ error: "Action non autorisée. Seul l'initiateur peut annuler la déclaration." }, { status: 403 });
    }

    if (declaration.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: `Impossible d'annuler une déclaration ayant le statut : ${declaration.statut}` }, { status: 400 });
    }

    const cancelled = await prisma.declarationBail.update({
      where: { id: declarationId },
      data: {
        statut: "ANNULEE",
        reponseAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Déclaration annulée avec succès.",
      data: cancelled
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-04 DELETE declaration]", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'annulation" }, { status: 500 });
  }
}
