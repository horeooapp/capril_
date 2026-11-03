import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { getAdminAgentMonthlyCost } from "@/actions/bdq-ai";

/**
 * AGT-08 — GET /api/v1/admin/agent/cout-mensuel
 * Coût total Claude API du mois · projection fin de mois · ROI conversion BDQ
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const costReport = await getAdminAgentMonthlyCost();
    return NextResponse.json({ success: true, ...costReport });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors du calcul du coût mensuel Claude API" },
      { status: 500 }
    );
  }
}

