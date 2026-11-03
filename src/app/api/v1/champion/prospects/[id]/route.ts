import { NextRequest, NextResponse } from "next/server";
import { deleteChampionProspect, updateChampionProspect } from "@/actions/champion.actions";

/**
 * CHP-06 : PUT /api/v1/champion/prospects/[id]
 * Mettre à jour un prospect (statut, note, date de rappel).
 */
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const res = await updateChampionProspect(id, body);
        if (!res.success) {
            return NextResponse.json({ error: res.error }, { status: 400 });
        }
        return NextResponse.json(res);
    } catch (error: any) {
        return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
}

/**
 * CHP-07 : DELETE /api/v1/champion/prospects/[id]
 * Supprimer un prospect du carnet.
 */
export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const res = await deleteChampionProspect(id);
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
}

