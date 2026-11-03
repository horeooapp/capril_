import { NextResponse } from "next/server";
import { getChampionWeeklyReport } from "@/actions/champion.actions";

/**
 * CHP-09 : GET /api/v1/champion/rapport-semaine
 * Rapport hebdomadaire du Champion connecté (ADD-15 Section 3.3).
 */
export async function GET() {
    const res: any = await getChampionWeeklyReport();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 401 });
    }
    return NextResponse.json(res);
}

