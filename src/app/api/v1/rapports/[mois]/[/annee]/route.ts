import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { generateOwnerMonthlyReport } from "@/actions/rapports-mensuels";

/**
 * RPT-02 — GET /api/v1/rapports/[mois]/[annee]
 * Récupérer le rapport d'un mois spécifique · JSON + PDF (Génère à la volée si non encore créé)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mois: string; annee: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { mois, annee } = await params;
    const m = parseInt(mois, 10);
    const y = parseInt(annee, 10);

    let rapport = await prisma.rapportMensuel.findFirst({
      where: {
        userId: user.id,
        periodeMois: m,
        periodeAnnee: y,
        typeRapport: "MENSUEL",
      },
    });

    if (!rapport) {
      const gen = await generateOwnerMonthlyReport(user.id, m, y, "MENSUEL");
      if (!gen.success) {
        return NextResponse.json({ error: gen.error || "Impossible de générer le rapport" }, { status: 404 });
      }
      rapport = await prisma.rapportMensuel.findUnique({ where: { id: gen.reportId } });
    }

    return NextResponse.json({
      success: true,
      rapport_id: rapport?.id,
      periode_mois: rapport?.periodeMois,
      periode_annee: rapport?.periodeAnnee,
      type_rapport: rapport?.typeRapport,
      pdf_url: rapport?.pdfUrl,
      envoye_whatsapp: rapport?.envoyeWhatsapp,
      envoye_email: rapport?.envoyeEmail,
      data_rapport: rapport?.dataRapport,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

