import { NextResponse } from "next/server";
import { getAdminChampionsList } from "@/actions/champion.actions";

/**
 * CHP-10 : GET /api/v1/admin/champions
 * Liste de tous les Champions + stats globales (Admin QAPRIL).
 */
export async function GET() {
    const res = await getAdminChampionsList();
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 403 });
    }
    return NextResponse.json(res);
}

