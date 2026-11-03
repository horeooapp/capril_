import { NextRequest, NextResponse } from "next/server";
import { payChampionCommissionsBatch } from "@/actions/champion.actions";

/**
 * CHP-12 : POST /api/v1/admin/champions/commissions/payer
 * Déclencher le paiement groupé des commissions validées (A15-UAT-11).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const res = await payChampionCommissionsBatch({
            champion_id: body.champion_id || body.championId,
            mode_paiement: body.mode_paiement || body.modePaiement || "WAVE",
        });
        if (!res.success) {
            return NextResponse.json({ error: res.error }, { status: 403 });
        }
        return NextResponse.json(res);
    } catch (error: any) {
        return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }
}

