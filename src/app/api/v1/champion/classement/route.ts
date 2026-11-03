import { NextResponse } from "next/server";
import { getZoneLeaderboard } from "@/actions/champion.actions";

/**
 * CHP-08 : GET /api/v1/champion/classement
 * Classement anonymisé des Champions de la zone (A15-UAT-12).
 */
export async function GET() {
    const res = await getZoneLeaderboard();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 401 });
    }
    return NextResponse.json(res);
}

