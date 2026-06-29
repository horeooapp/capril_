import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-06: Demander la re-photo d'une page
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await req.json();
        const { pageIndex } = body; 

        const session = await prisma.waSession.findUnique({ where: { id: params.id } });
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        const updated = await prisma.waSession.update({
            where: { id: params.id },
            data: { etat: "RECAPTURE" }
        });
        
        // Simuler message sortant Meta WA
        console.log(`[WA OUT] To ${session.numeroWa}: La page ${pageIndex} est illisible. Merci de reprendre la photo avec plus de lumière et bien à plat.`);
        
        return NextResponse.json({ status: "OK", session: updated });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
