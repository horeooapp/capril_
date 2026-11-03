import { NextResponse } from "next/server";
import { getChampionCurrentMonthCommissions } from "@/actions/champion.actions";

/**
 * CHP-03 : GET /api/v1/champion/commissions/mois-courant
 * Détail des commissions du mois en cours.
 */
export async function GET() {
    const res = await getChampionCurrentMonthCommissions();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 401 });
    }
    return NextResponse.json(res);
}

