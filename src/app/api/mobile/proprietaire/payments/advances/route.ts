import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/payments/advances
 * Liste toutes les avances sur loyer pour les baux du propriétaire
 *
 * POST /api/mobile/proprietaire/payments/advances
 * Enregistre une avance sur loyer lors de la création/renouvellement d'un bail
 * Body: { leaseId, amount, description? }
 *
 * Règle légale : avance max = 2 mois de loyer (Art. 415 CCH Côte d'Ivoire)
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId = searchParams.get('leaseId') ?? undefined;

        const where: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) where.id = leaseId;

        const leases = await prisma.lease.findMany({
            where: { ...where, avanceLoyer: { gt: 0 } },
            select: {
                id:             true,
                leaseReference: true,
                rentAmount:     true,
                avanceLoyer:    true,
                startDate:      true,
                status:         true,
                tenant: {
                    select: { firstName: true, lastName: true, phone: true },
                },
                property: {
                    select: { name: true, address: true, commune: true },
                },
            },
            orderBy: { startDate: 'desc' },
        });

        const advances = leases.map(l => ({
            leaseId:        l.id,
            leaseReference: l.leaseReference,
            avanceLoyer:    Number(l.avanceLoyer ?? 0),
            rentAmount:     Number(l.rentAmount),
            maxLegal:       Number(l.rentAmount) * 2,
            startDate:      l.startDate?.toISOString() ?? null,
            leaseStatus:    l.status,
            tenant:         l.tenant
                              ? `${l.tenant.firstName ?? ''} ${l.tenant.lastName ?? ''}`.trim()
                              : 'Locataire',
            property:       l.property?.name ?? l.property?.address ?? 'Bien',
            commune:        l.property?.commune ?? '',
        }));

        return NextResponse.json({
            advances,
            totalAdvances: advances.reduce((acc, a) => acc + a.avanceLoyer, 0),
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/payments/advances GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const body = await request.json();
        const { leaseId, amount } = body;

        if (!leaseId || !amount) {
            return NextResponse.json(
                { error: 'leaseId et amount sont requis.' },
                { status: 400 }
            );
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                ],
            },
        });
        if (!lease) {
            return NextResponse.json({ error: 'Bail introuvable ou accès refusé.' }, { status: 404 });
        }

        // Validation légale : avance max = 2 mois (Art. 415 CCH)
        const maxLegal = Number(lease.rentAmount) * 2;
        if (Number(amount) > maxLegal) {
            return NextResponse.json(
                { error: `Avance illégale. Maximum autorisé : ${maxLegal} XOF (2 mois de loyer — Art. 415 CCH).`, code: 'AVANCE_ILLEGALE' },
                { status: 422 }
            );
        }

        const updated = await prisma.lease.update({
            where: { id: leaseId },
            data:  { avanceLoyer: Number(amount) },
        });

        return NextResponse.json({
            success:     true,
            message:     'Avance enregistrée sur le bail.',
            leaseId:     updated.id,
            avanceLoyer: Number(updated.avanceLoyer),
            currency:    'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/payments/advances POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
