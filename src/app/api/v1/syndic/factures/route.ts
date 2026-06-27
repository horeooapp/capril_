import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSyndicFacture } from "@/actions/syndic-b2b.actions";

export async function GET() {
    try {
        const factures = await prisma.syndicFacture.findMany({
            orderBy: { createdAt: "desc" },
            include: { syndicate: true }
        });
        
        return NextResponse.json({ success: true, factures }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { syndicateId, periode, nbLots, montantParLot } = body;

        if (!syndicateId || !periode || !nbLots || !montantParLot) {
            return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 });
        }

        const result = await createSyndicFacture(syndicateId, periode, nbLots, montantParLot);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
