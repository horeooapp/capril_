import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { 
            leaseId, 
            dateReprise, 
            loyerEnVigueur, 
            chargesEnVigueur = 0, 
            dernierMoisPaye, 
            soldeOuverture = 0,
            clausesDerogatoires
        } = body;

        if (!leaseId || !dateReprise || !loyerEnVigueur) {
            return NextResponse.json({ error: "Champs requis : leaseId, dateReprise, loyerEnVigueur" }, { status: 400 });
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
        }

        if (lease.landlordId !== user.userId) {
            return NextResponse.json({ error: "Non autorisé sur ce bail" }, { status: 403 });
        }

        const now = new Date();
        const openingState = await prisma.leaseOpeningState.upsert({
            where: { leaseId },
            create: {
                leaseId,
                dateReprise: new Date(dateReprise),
                loyerEnVigueur: Math.round(loyerEnVigueur),
                chargesEnVigueur: Math.round(chargesEnVigueur),
                dernierMoisPaye: dernierMoisPaye || null,
                soldeOuverture: Math.round(soldeOuverture),
                clausesDerogatoires: clausesDerogatoires || null,
                confirmeBailleurAt: now,
                statut: "EN_ATTENTE"
            },
            update: {
                dateReprise: new Date(dateReprise),
                loyerEnVigueur: Math.round(loyerEnVigueur),
                chargesEnVigueur: Math.round(chargesEnVigueur),
                dernierMoisPaye: dernierMoisPaye || null,
                soldeOuverture: Math.round(soldeOuverture),
                clausesDerogatoires: clausesDerogatoires || null,
                confirmeBailleurAt: now,
                statut: "EN_ATTENTE"
            }
        });

        return NextResponse.json({
            success: true,
            message: "État d'ouverture du bail antérieur (Deux Horloges) enregistré.",
            data: openingState
        });
    } catch (e: any) {
        console.error("[MOBILE API] proprietaire/reprise-bail error:", e);
        return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
    }
}
