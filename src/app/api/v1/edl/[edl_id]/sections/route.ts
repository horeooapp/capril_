import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * EDL-02 — PUT /api/v1/edl/[edl_id]/sections
 * Ajouter ou mettre à jour les sections, photos horodatées, relevés compteurs et inventaire des clés
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ edl_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { edl_id } = await params;
    const edl = await prisma.etatsDesLieux.findUnique({ where: { id: edl_id } });
    if (!edl) {
      return NextResponse.json({ error: "État des lieux introuvable" }, { status: 404 });
    }

    if (edl.statut === "CERTIFIE") {
      return NextResponse.json(
        { error: "Cet état des lieux est déjà certifié SHA-256 et ne peut plus être modifié." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await prisma.etatsDesLieux.update({
      where: { id: edl_id },
      data: {
        sections: body.sections !== undefined ? body.sections : edl.sections,
        indexEau: body.index_eau ?? body.indexEau ?? edl.indexEau,
        indexElec: body.index_elec ?? body.indexElec ?? edl.indexElec,
        clesRemises: body.cles_remises ?? body.clesRemises ?? edl.clesRemises,
        clesDetail: body.cles_detail ?? body.clesDetail ?? edl.clesDetail,
      },
    });

    return NextResponse.json({
      success: true,
      edl_id: updated.id,
      ref_edl: updated.refEdl,
      edl: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur mise à jour EDL" }, { status: 500 });
  }
}

