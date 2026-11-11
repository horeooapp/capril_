import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { action, motifContestation } = body; // action: 'CONFIRMER' | 'CONTESTER'

        if (!['CONFIRMER', 'CONTESTER'].includes(action)) {
            return NextResponse.json({ error: "Action invalide ('CONFIRMER' ou 'CONTESTER')" }, { status: 400 });
        }

        const state = await prisma.leaseOpeningState.findUnique({
            where: { id },
            include: { lease: true }
        });

        if (!state) {
            return NextResponse.json({ error: "État d'ouverture introuvable" }, { status: 404 });
        }

        if (state.lease.tenantId !== user.userId) {
            return NextResponse.json({ error: "Non autorisé sur ce bail" }, { status: 403 });
        }

        const now = new Date();
        const updated = await prisma.leaseOpeningState.update({
            where: { id },
            data: {
                statut: action === 'CONFIRMER' ? 'CONFIRME' : 'CONTESTE',
                confirmeLocataireAt: action === 'CONFIRMER' ? now : null,
                motifContestation: action === 'CONTESTER' ? (motifContestation || "Divergence signalée par le locataire") : null,
            }
        });

        return NextResponse.json({
            success: true,
            message: action === 'CONFIRMER' 
                ? "L'état d'ouverture du bail antérieur a été validé." 
                : "Votre signalement a été enregistré. Le propriétaire a été notifié pour régularisation.",
            data: updated
        });
    } catch (e: any) {
        console.error("[MOBILE API] locataire/reprise-bail error:", e);
        return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
    }
}
