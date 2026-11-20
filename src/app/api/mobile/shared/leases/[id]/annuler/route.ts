import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { annulerBailEnAttente, BailEnAttenteError } from '@/lib/bail-en-attente';

/** [IC-09] Annule un bail non signé et sans quittance. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        const { id } = await params;
        await annulerBailEnAttente(prisma, { leaseId: id, demandeurId: user.userId, role: (user as any).role });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e instanceof BailEnAttenteError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === 'ACCES' ? 403 : e.code === 'INTROUVABLE' ? 404 : 400 });
        console.error("[MOBILE] annulation bail", e);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
