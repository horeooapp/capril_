import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { generateOwnerMonthlyReport } from "@/actions/rapports-mensuels";

/**
 * RPT-03 — POST /api/v1/rapports/[mois]/[annee]/regenerer
 * Regénérer manuellement un rapport si les données ont été mises à jour
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ mois: string; annee: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { mois, annee } = await params;
    const m = parseInt(mois, 10);
    const y = parseInt(annee, 10);

    const res = await generateOwnerMonthlyReport(user.id, m, y, "MENSUEL");
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      rapport_id: res.reportId,
      pdf_url: res.pdfUrl,
      rapport: res.rapport,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

