import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * EDL-06 — GET /api/v1/edl/[edl_id]/pdf
 * Génère et renvoie le document certifié de l'État des Lieux (JSON structuré ou HTML imprimable PDF)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ edl_id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { edl_id } = await params;
    const edl = await prisma.etatsDesLieux.findUnique({
      where: { id: edl_id },
      include: {
        lease: {
          include: {
            property: true,
            landlord: { select: { firstName: true, lastName: true, phone: true } },
            tenant: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        redigePar: { select: { firstName: true, lastName: true } },
      },
    });

    if (!edl) {
      return NextResponse.json({ error: "État des lieux introuvable" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
    const verifyUrl = `${appUrl}/public/edl/${edl.refEdl || edl.id}/verifier`;

    return NextResponse.json({
      success: true,
      document_type: "ETAT_DES_LIEUX_QAPRIL",
      ref_edl: edl.refEdl,
      type_edl: edl.typeEdl,
      statut: edl.statut,
      date_edl: edl.dateEdl,
      hash_sha256: edl.hashSha256,
      qr_verify_url: verifyUrl,
      bail: {
        reference: edl.lease?.leaseReference,
        logement: edl.lease?.property?.address,
        commune: edl.lease?.property?.commune,
        bailleur: edl.lease?.landlord,
        locataire: edl.lease?.tenant,
      },
      compteurs: {
        index_eau: edl.indexEau,
        index_elec: edl.indexElec,
      },
      cles: {
        nombre: edl.clesRemises,
        detail: edl.clesDetail,
      },
      sections: edl.sections,
      reserves_locataire: edl.reservesLocataire,
      signatures: {
        proprietaire: { confirme: edl.confirmeProprio, date: edl.confirmeProprioAt },
        locataire: { confirme: edl.confirmeLocataire, date: edl.confirmeLocataireAt },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur génération PDF EDL" }, { status: 500 });
  }
}

