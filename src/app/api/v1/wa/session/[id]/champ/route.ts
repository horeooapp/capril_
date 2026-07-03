import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-05: Confirmer/corriger un champ (par API direct ou Webhook)
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await req.json();
        const { champ, valeur, action } = body; // action: CONFIRMER | CORRIGER

        const session = await prisma.waSession.findUnique({ where: { id: params.id } });
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        const champs = JSON.parse((session.champs as string) || "{}");
        
        if (!champs[champ]) {
            return NextResponse.json({ error: "Champ inconnu" }, { status: 400 });
        }
        
        if (action === "CONFIRMER") {
            champs[champ].statut = "CONFIRME";
        } else if (action === "CORRIGER") {
            champs[champ].statut = "CORRIGE";
            champs[champ].valeur = valeur;
        } else {
            return NextResponse.json({ error: "Action invalide" }, { status: 400 });
        }
        
        const updated = await prisma.waSession.update({
            where: { id: params.id },
            data: { champs: JSON.stringify(champs) }
        });
        
        return NextResponse.json({ status: "OK", champs: JSON.parse(updated.champs as string) });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
