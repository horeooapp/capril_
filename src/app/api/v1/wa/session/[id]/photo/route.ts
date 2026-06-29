import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-02: Rattacher une photo à la session, relancer le minuteur
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await req.json();
        const { photoUrl } = body; 

        const session = await prisma.waSession.findUnique({ where: { id: params.id } });
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        const pages = JSON.parse((session.pages as string) || "[]");
        pages.push({ id: photoUrl, order: pages.length + 1, quality: null });
        
        const updated = await prisma.waSession.update({
            where: { id: params.id },
            data: { 
                pages: JSON.stringify(pages),
                dernierMsgAt: new Date()
            }
        });
        
        return NextResponse.json({ status: "OK", session: updated });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
