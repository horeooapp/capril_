import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/fiscal
 * Données fiscales : dossiers DGI, déclarations, récapitulatif annuel
 *
 * Query: year? (YYYY), leaseId?
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const year    = searchParams.get('year') ?? new Date().getFullYear().toString();
        const leaseId = searchParams.get('leaseId') ?? undefined;

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) landlordWhere.id = leaseId;

        // Récupérer les dossiers fiscaux
        const dossiersFiscaux = await (prisma as any).dossierFiscal.findMany({
            where: { lease: landlordWhere },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        rentAmount:     true,
                        property: { select: { name: true, address: true, commune: true } },
                        tenant:   { select: { firstName: true, lastName: true } },
                    },
                },
            },
        }).catch(() => []);

        // Revenus locatifs de l'année
        const periodPrefix = year;
        const receiptsYear = await prisma.receipt.findMany({
            where: {
                status:    'PAID',
                lease:     landlordWhere,
                periodMonth: { startsWith: periodPrefix },
            },
            select: {
                periodMonth: true,
                totalAmount: true,
                rentAmount:  true,
                chargesAmount: true,
            },
        });

        const revenusAnnuels = receiptsYear.reduce((acc, r) => acc + Number(r.totalAmount ?? r.rentAmount), 0);
        const chargesAnnuelles = receiptsYear.reduce((acc, r) => acc + Number(r.chargesAmount ?? 0), 0);
        // Abattement forfaitaire 30% (régime micro-foncier simplifié Côte d'Ivoire)
        const ABATTEMENT = 0.30;
        const revenuImposable = Math.max(0, revenusAnnuels * (1 - ABATTEMENT));

        return NextResponse.json({
            year:             parseInt(year),
            revenusLocatifs:  revenusAnnuels,
            chargesDeductibles: chargesAnnuelles,
            abattementForfaitaire: ABATTEMENT * 100,
            revenuImposable,
            receiptsCount:    receiptsYear.length,
            byMonth: receiptsYear.reduce((acc: Record<string, number>, r) => {
                acc[r.periodMonth] = (acc[r.periodMonth] ?? 0) + Number(r.totalAmount ?? r.rentAmount);
                return acc;
            }, {}),
            dossiersFiscaux: dossiersFiscaux.map((d: any) => ({
                id:             d.id,
                statut:         d.statut,
                anneeDeclaration: d.anneeDeclaration,
                montantDeclare: Number(d.montantDeclare ?? 0),
                leaseRef:       d.lease?.leaseReference,
                property:       d.lease?.property?.name ?? d.lease?.property?.address ?? 'Bien',
            })),
            currency: 'FCFA',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/fiscal GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
