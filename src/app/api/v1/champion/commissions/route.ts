import { NextResponse } from "next/server";
import { getChampionCommissionsHistory } from "@/actions/champion.actions";

/**
 * CHP-02 : GET /api/v1/champion/commissions
 * Historique des commissions par mois.
 */
export async function GET() {
    const res = await getChampionCommissionsHistory();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 401 });
    }
    return NextResponse.json(res);
}

