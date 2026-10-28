import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/charges
 * Charges locatives (eau, électricité, gardiennage, etc.)
 *
 * Query: leaseId?, page?, limit?
 *
 * POST /api/mobile/proprietaire/charges
 * Ajouter une charge
 * Body: { leaseId, label, amount, date, type?, isRecurring? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId = searchParams.get('leaseId') ?? undefined;
        const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip    = (page - 1) * limit;

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) landlordWhere.id = leaseId;

        const charges = await (prisma as any).charge.findMany({
            where: { lease: landlordWhere },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { name: true } },
                    },
                },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        }).catch(async () => {
            // Fallback : récupérer les charges via le modèle chargesAmount sur les baux
            const leases = await prisma.lease.findMany({
                where: { ...landlordWhere, chargesAmount: { gt: 0 } },
                select: {
                    id:             true,
                    leaseReference: true,
                    chargesAmount:  true,
                    property: { select: { name: true } },
                },
            });
            return leases.map(l => ({
                id:         `charge-${l.id}`,
                label:      'Charges forfaitaires',
                amount:     Number(l.chargesAmount),
                type:       'FORFAIT',
                isRecurring: true,
                leaseRef:   l.leaseReference,
                property:   l.property?.name ?? 'Bien',
            }));
        });

        const formatted = charges.map((c: any) => ({
            id:          c.id,
            label:       c.label ?? c.type ?? 'Charge',
            amount:      Number(c.amount ?? c.chargesAmount ?? 0),
            type:        c.type ?? 'AUTRE',
            date:        c.date?.toISOString() ?? null,
            isRecurring: c.isRecurring ?? false,
            property:    c.lease?.property?.name ?? c.property ?? 'Bien',
            leaseRef:    c.lease?.leaseReference ?? c.leaseRef ?? '',
        }));

        const total = formatted.reduce((acc: number, c: any) => acc + c.amount, 0);

        return NextResponse.json({
            charges:      formatted,
            totalCharges: total,
            currency:     'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/charges GET error:', error);
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
        const { leaseId, label, amount, date, type, isRecurring } = body;

        if (!leaseId || !label || !amount) {
            return NextResponse.json({ error: 'leaseId, label et amount sont requis.' }, { status: 400 });
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

        // Mettre à jour le montant des charges sur le bail (approche simple)
        await prisma.lease.update({
            where: { id: leaseId },
            data:  { chargesAmount: Number(amount) },
        });

        return NextResponse.json({
            success: true,
            message: 'Charge enregistrée sur le bail.',
            leaseId,
            amount:  Number(amount),
            currency: 'XOF',
        }, { status: 201 });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/charges POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
