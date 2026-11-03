import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * EDL-07 — GET /api/public/edl/[ref]/verifier
 * Vérification publique QR code · authenticité SHA-256 (A15-UAT-12)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;

    const edl = await prisma.etatsDesLieux.findFirst({
      where: {
        OR: [{ refEdl: ref }, { id: ref }],
      },
      include: {
        lease: {
          include: {
            property: { select: { address: true, commune: true, unitLabel: true } },
            landlord: { select: { firstName: true, lastName: true } },
            tenant: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!edl) {
      return NextResponse.json(
        { authentic: false, error: "Aucun État des Lieux QAPRIL trouvé pour cette référence." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authentic: true,
      ref_edl: edl.refEdl,
      type_edl: edl.typeEdl,
      statut: edl.statut,
      date_edl: edl.dateEdl,
      hash_sha256: edl.hashSha256,
      confirme_proprio: edl.confirmeProprio,
      confirme_locataire: edl.confirmeLocataire,
      logement: edl.lease?.property,
      parties: {
        proprietaire: [edl.lease?.landlord?.firstName, edl.lease?.landlord?.lastName]
          .filter(Boolean)
          .join(" "),
        locataire: [edl.lease?.tenant?.firstName, edl.lease?.tenant?.lastName]
          .filter(Boolean)
          .join(" "),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authentic: false, error: error.message }, { status: 500 });
  }
}

