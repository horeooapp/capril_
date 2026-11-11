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
        const { leaseId, nouveauMontant, dateEffet, raison } = body;

        if (!leaseId || !nouveauMontant || !dateEffet) {
            return NextResponse.json({ error: "Tous les champs sont requis (bail, montant, date d'effet)." }, { status: 400 });
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
        }

        if (lease.landlordId !== user.userId) {
            return NextResponse.json({ error: "Non autorisé sur ce bail" }, { status: 403 });
        }

        const dateEffetObj = new Date(dateEffet);
        const now = new Date();

        // Calcul triennal
        const lastHist = await prisma.leaseRentHistory.findFirst({
            where: { leaseId },
            orderBy: { effectiveLe: "desc" }
        });
        const refDate = lastHist?.effectiveLe ? new Date(lastHist.effectiveLe) : new Date(lease.startDate);
        const diffYears = (dateEffetObj.getTime() - refDate.getTime()) / (1000 * 3600 * 24 * 365.25);
        const estConformeDelaiAns = diffYears >= 3 || nouveauMontant <= lease.rentAmount;

        const diffMonths = (dateEffetObj.getTime() - now.getTime()) / (1000 * 3600 * 24 * 30);
        const estConformePreavis = diffMonths >= 3 || nouveauMontant <= lease.rentAmount;

        let motifNullite: string | null = null;
        if (!estConformeDelaiAns) {
            motifNullite = "Délai triennal de 3 ans non atteint depuis la dernière fixation du loyer.";
        } else if (!estConformePreavis) {
            motifNullite = "Préavis inférieur aux 3 mois réglementaires.";
        }

        const prop = await prisma.propositionLoyer.create({
            data: {
                leaseId,
                montantActuel: lease.rentAmount,
                nouveauMontant: Math.round(nouveauMontant),
                dateEffet: dateEffetObj,
                dateEffetDemandee: dateEffetObj,
                dateNotification: now,
                raison: raison || "Révision triennale de loyer (Code CCH)",
                statut: "EN_ATTENTE",
                estConformeDelaiAns,
                estConformePreavis,
                motifNullite
            }
        });

        return NextResponse.json({
            success: true,
            message: "Proposition de révision de loyer transmise au locataire.",
            data: prop
        });
    } catch (e: any) {
        console.error("[MOBILE API] proprietaire/propositions-loyer error:", e);
        return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
    }
}

