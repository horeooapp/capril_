import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { randomUUID } from 'crypto';

/**
 * GET /api/mobile/proprietaire/payments
 * Historique complet des paiements reçus pour les biens du propriétaire
 *
 * Query: leaseId?, page?, limit?, periodMonth?
 *
 * POST /api/mobile/proprietaire/payments
 * Enregistrer un paiement manuel (loyer perçu hors plateforme)
 * Body: { leaseId, periodMonth, amount, paymentMethod, paymentRef? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId     = searchParams.get('leaseId') ?? undefined;
        const periodMonth = searchParams.get('periodMonth') ?? undefined;
        const page        = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit       = Math.min(100, parseInt(searchParams.get('limit') ?? '30'));
        const skip        = (page - 1) * limit;

        const where: any = {
            status: 'PAID',
            lease: {
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                ],
            },
        };
        if (leaseId)     where.leaseId     = leaseId;
        if (periodMonth) where.periodMonth = periodMonth;

        const [receipts, total] = await Promise.all([
            prisma.receipt.findMany({
                where,
                include: {
                    lease: {
                        select: {
                            leaseReference: true,
                            property: { select: { name: true, address: true, commune: true } },
                            tenant:   { select: { firstName: true, lastName: true, phone: true } },
                        },
                    },
                },
                orderBy: { paidAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.receipt.count({ where }),
        ]);

        // Agrégats financiers
        const totalReceivedQuery = await prisma.receipt.aggregate({
            where,
            _sum: { totalAmount: true },
        });

        const payments = receipts.map(r => ({
            id:           r.id,
            receiptRef:   r.receiptRef,
            periodMonth:  r.periodMonth,
            amount:       Number(r.totalAmount ?? r.rentAmount),
            paymentMethod:r.paymentMethod,
            paymentRef:   r.paymentRef,
            paidAt:       r.paidAt?.toISOString() ?? null,
            type:         'INCOME',
            property:     r.lease.property?.name ?? r.lease.property?.address ?? 'Bien',
            commune:      r.lease.property?.commune ?? '',
            tenant:       r.lease.tenant
                            ? `${r.lease.tenant.firstName ?? ''} ${r.lease.tenant.lastName ?? ''}`.trim()
                            : 'Locataire',
            leaseRef:     r.lease.leaseReference,
        }));

        return NextResponse.json({
            payments,
            totalReceived: Number(totalReceivedQuery._sum.totalAmount ?? 0),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/payments GET error:', error);
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
        const { leaseId, periodMonth, amount, paymentMethod, paymentRef } = body;

        if (!leaseId || !periodMonth || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: 'leaseId, periodMonth, amount et paymentMethod sont requis.' },
                { status: 400 }
            );
        }

        // Vérification accès bail
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

        // Vérifier doublon
        const existing = await prisma.receipt.findFirst({
            where: { leaseId, periodMonth, status: 'PAID' },
        });
        if (existing) {
            return NextResponse.json(
                { error: `Un paiement existe déjà pour ${periodMonth}.`, code: 'DOUBLON' },
                { status: 409 }
            );
        }

        const ref = `MAN-${periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const receipt = await prisma.receipt.create({
            data: {
                receiptRef:   ref,
                leaseId,
                periodMonth,
                rentAmount:   Number(amount),
                totalAmount:  Number(amount),
                paymentMethod,
                paymentRef:   paymentRef ?? null,
                paidAt:       new Date(),
                qrToken:      randomUUID(),
                status:       'PAID',
            },
        });

        return NextResponse.json({
            success:    true,
            message:    'Paiement enregistré manuellement.',
            receiptId:  receipt.id,
            receiptRef: receipt.receiptRef,
            currency:   'XOF',
        }, { status: 201 });

    } catch (error: any) {
        console.error('[MOBILE] proprietaire/payments POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
