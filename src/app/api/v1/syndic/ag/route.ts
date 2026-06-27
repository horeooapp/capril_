import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleSyndicAG, uploadSyndicAGMinutes } from "@/actions/syndic-b2b.actions";

export async function GET() {
    try {
        const ags = await prisma.syndicAG.findMany({
            orderBy: { dateAG: "desc" },
            include: { syndicate: true }
        });
        
        return NextResponse.json({ success: true, ags }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, syndicateId, ordreDuJour, dateAG, agId, compteRendu } = body;

        if (action === "UPLOAD_MINUTES") {
            if (!agId || !compteRendu) {
                return NextResponse.json({ success: false, error: "agId et compteRendu sont requis" }, { status: 400 });
            }
            const result = await uploadSyndicAGMinutes(agId, compteRendu);
            return NextResponse.json(result, { status: 200 });
        }

        // Default: Schedule AG
        if (!syndicateId || !ordreDuJour || !dateAG) {
            return NextResponse.json({ success: false, error: "syndicateId, ordreDuJour et dateAG sont requis" }, { status: 400 });
        }

        const result = await scheduleSyndicAG(syndicateId, ordreDuJour, new Date(dateAG));
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
