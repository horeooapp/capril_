import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { EdlStatut } from "@prisma/client";
import crypto from "crypto";

/**
 * EDL-04 — PUT /api/v1/edl/[edl_id]/confirmer-locataire
 * Locataire confirme ou émet des réserves (A15-UAT-02)
 */
export async function PUT(
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
            landlord: true,
            tenant: true,
          },
        },
      },
    });

    if (!edl) {
      return NextResponse.json({ error: "État des lieux introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const confirme = body.confirme !== undefined ? Boolean(body.confirme) : true;
    const reserves = body.reserves || body.reserves_locataire || null;

    const now = new Date();
    const hashPayload = JSON.stringify({
      refEdl: edl.refEdl,
      leaseId: edl.leaseId,
      typeEdl: edl.typeEdl,
      sections: edl.sections,
      indexEau: edl.indexEau,
      indexElec: edl.indexElec,
      clesRemises: edl.clesRemises,
      reserves,
      confirmedAt: now.toISOString(),
    });
    const hashSha256 = crypto.createHash("sha256").update(hashPayload).digest("hex");

    const nextStatut = confirme ? EdlStatut.CERTIFIE : EdlStatut.CONTESTE;

    const updated = await prisma.etatsDesLieux.update({
      where: { id: edl_id },
      data: {
        statut: nextStatut,
        confirmeLocataire: confirme,
        confirmeLocataireAt: now,
        reservesLocataire: reserves,
        hashSha256: confirme ? hashSha256 : edl.hashSha256,
        pdfUrl: `/api/v1/edl/${edl_id}/pdf`,
      },
    });

    // Notifier les deux parties si certifié
    if (confirme) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
      const msg = `QAPRIL : État des lieux ${edl.refEdl} certifié SHA-256. Vérifiez l'authenticité sur ${appUrl}/public/edl/${edl.refEdl}/verifier`;
      if (edl.lease?.landlord?.phone) {
        await sendSMS(edl.lease.landlord.phone, msg).catch(() => null);
      }
      if (edl.lease?.tenant?.phone) {
        await sendSMS(edl.lease.tenant.phone, msg).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      edl_id: updated.id,
      ref_edl: updated.refEdl,
      statut: updated.statut,
      hash_sha256: updated.hashSha256,
      pdf_url: updated.pdfUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur confirmation EDL" }, { status: 500 });
  }
}

