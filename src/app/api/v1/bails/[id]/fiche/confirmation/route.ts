import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-06
 * Double confirmation ou correction des mentions de la fiche de bail
 * Règle RG-DCL-19
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: leaseId } = await params;
    const userId = session.user.id;
    const body = await request.json();

    const { corrections } = body; // Optionnel : ajustement champ par champ

    const fiche = await prisma.ficheBail.findUnique({
      where: { leaseId },
      include: { lease: true }
    });

    if (!fiche) {
      return NextResponse.json({ error: "Fiche de bail introuvable" }, { status: 404 });
    }

    // RG-DCL-19 : La confirmation doit être effectuée par la contrepartie (saisie_par != confirmee_par)
    if (fiche.saisieParId === userId) {
      return NextResponse.json(
        { error: "La confirmation des mentions doit être effectuée par l'autre partie au contrat (double validation RG-DCL-19)." },
        { status: 400 }
      );
    }

    let mentionsActualisees = fiche.mentions as any;
    if (corrections && typeof corrections === "object") {
      mentionsActualisees = {
        ...mentionsActualisees,
        ...corrections
      };
    }

    const updatedFiche = await prisma.ficheBail.update({
      where: { leaseId },
      data: {
        mentions: mentionsActualisees,
        confirmeeParId: userId,
        confirmeeAt: new Date()
      }
    });

    // Activer pleinement le bail pour émission des quittances
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: "ACTIVE"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Mentions de la fiche de bail confirmées avec succès. Le quittancement est désormais immédiatement débloqué.",
      data: updatedFiche
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-06 POST confirmation-fiche]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la confirmation" }, { status: 500 });
  }
}
