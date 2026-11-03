import { NextRequest, NextResponse } from "next/server";
import { createChampionProspect, listChampionProspects } from "@/actions/champion.actions";

/**
 * CHP-04 : GET /api/v1/champion/prospects
 * Liste des prospects du carnet Champion (filtrable par statut).
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut") || undefined;
    const res = await listChampionProspects(undefined, statut);
    if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 401 });
    }
    return NextResponse.json(res);
}

/**
 * CHP-05 : POST /api/v1/champion/prospects
 * Ajouter un prospect dans le carnet (avec vérification silencieuse doublon QAPRIL).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await createChampionProspect(body);
        if (!res.success) {
            return NextResponse.json({ error: res.error }, { status: 400 });
        }
        return NextResponse.json(res, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
}

