import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { corrigerNumeroLocataire, BailEnAttenteError } from '@/lib/bail-en-attente';

/** [IC-09] Corrige le numéro (et au besoin le nom) du locataire d'un bail non signé. Corps : { telephone, nom? } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        const { id } = await params;
        const corps = await request.json().catch(() => ({}));
        const r = await corrigerNumeroLocataire(prisma, { leaseId: id, demandeurId: user.userId, role: (user as any).role, telephone: String(corps.telephone || ''), nom: corps.nom });
        return NextResponse.json({ success: true, telephone: r.telephone, message: "Numéro corrigé. Renvoyez le bail à la signature pour que le locataire reçoive son code." });
    } catch (e: any) {
        if (e instanceof BailEnAttenteError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === 'ACCES' ? 403 : e.code === 'INTROUVABLE' ? 404 : 400 });
        console.error("[MOBILE] correction numéro locataire", e);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
