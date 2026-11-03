import { NextRequest, NextResponse } from "next/server";
import { updateChampionMonthlyTarget } from "@/actions/champion.actions";

/**
 * CHP-11 : PUT /api/v1/admin/champions/[id]/objectif
 * Modifier l'objectif mensuel d'un Champion (Admin QAPRIL).
 */
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const res = await updateChampionMonthlyTarget(id, Number(body.objectif_mensuel || body.objectifMensuel || 30));
        if (!res.success) {
            return NextResponse.json({ error: res.error }, { status: 403 });
        }
        return NextResponse.json(res);
    } catch (error: any) {
        return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
}

