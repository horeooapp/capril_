import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-04: Lire les champs extraits + scores + statuts
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await prisma.waSession.findUnique({
            where: { id: params.id },
            select: { champs: true, champCourant: true, etat: true }
        });
        
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        return NextResponse.json({
            etat: session.etat,
            champCourant: session.champCourant,
            champs: session.champs ? JSON.parse(session.champs as string) : {}
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
