import { NextResponse } from "next/server";
import { getChampionDashboardData } from "@/actions/champion.actions";

/**
 * CHP-01 : GET /api/v1/champion/dashboard
 * Tableau de bord complet du Champion connecté (5 blocs — ADD-15 Section 3.1).
 */
export async function GET() {
    const res = await getChampionDashboardData();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: res.error === "Non authentifié" ? 401 : 500 });
    }
    return NextResponse.json(res);
}

