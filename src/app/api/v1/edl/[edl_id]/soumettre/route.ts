import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { EdlStatut } from "@prisma/client";

/**
 * EDL-03 — POST /api/v1/edl/[edl_id]/soumettre
 * Soumettre au locataire pour confirmation · déclenche notification et délai de 48h (A15-UAT-01)
 */
export async function POST(
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
            tenant: true,
            property: true,
          },
        },
      },
    });

    if (!edl) {
      return NextResponse.json({ error: "État des lieux introuvable" }, { status: 404 });
    }

    const expireAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // +48h

    const updated = await prisma.etatsDesLieux.update({
      where: { id: edl_id },
      data: {
        statut: EdlStatut.SOUMIS_LOCATAIRE,
        confirmeProprio: true,
        confirmeProprioAt: new Date(),
        expireConfirmationAt: expireAt,
        pdfUrl: `/api/v1/edl/${edl_id}/pdf`,
      },
    });

    // Notification au locataire (ADD-15 Section 1.3 Étape 5)
    const tenantPhone = edl.lease?.tenant?.phone;
    if (tenantPhone) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
      const typeLabel = edl.typeEdl === "SORTIE" ? "sortie" : "entrée";
      await sendSMS(
        tenantPhone,
        `QAPRIL : Votre état des lieux ${typeLabel} (${edl.refEdl}) est prêt. Vérifiez et confirmez sous 48h sur ${appUrl}/mon-espace-locataire`
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      edl_id: updated.id,
      ref_edl: updated.refEdl,
      statut: updated.statut,
      expire_confirmation_at: updated.expireConfirmationAt,
      pdf_url: updated.pdfUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur soumission EDL" }, { status: 500 });
  }
}

