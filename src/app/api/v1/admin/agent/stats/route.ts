import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { getAdminAgentStats } from "@/actions/bdq-ai";

/**
 * AGT-07 — GET /api/v1/admin/agent/stats
 * Statistiques agent : taux complétion · coût API · durée moyenne
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const stats = await getAdminAgentStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors du calcul des statistiques Agent IA" },
      { status: 500 }
    );
  }
}

