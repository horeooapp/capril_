import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { getMonthlyReports } from "@/actions/rapports-mensuels";

/**
 * RPT-01 — GET /api/v1/rapports
 * Lister tous les rapports générés pour le compte propriétaire ou agence
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const rapports = await getMonthlyReports(user.id);
    return NextResponse.json({
      success: true,
      count: rapports.length,
      rapports,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

