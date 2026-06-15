import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { createHash, randomUUID } from 'crypto';

/**
 * GET /api/mobile/proprietaire/receipts
 * Liste toutes les quittances émises par le propriétaire (ou pour ses biens)
 *
 * Query params:
 *   - leaseId  : filtrer par bail
 *   - page     : pagination (défaut 1)
 *   - limit    : (défaut 20)
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId = searchParams.get('leaseId') ?? undefined;
        const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip   = (page - 1) * limit;

        const whereBase: any = {
            lease: {
                property: {
                    OR: [
                        { ownerUserId: user.userId },
                        { landlordId: user.userId },
                    ],
                },
            },
        };
        if (leaseId) whereBase.leaseId = leaseId;

        const [receipts, total] = await Promise.all([
            prisma.receipt.findMany({
                where: whereBase,
                include: {
                    lease: {
                        select: {
                            leaseReference: true,
                            property: { select: { name: true, address: true } },
                            tenant:   { select: { firstName: true, lastName: true, phone: true } },
                        },
                    },
                },
                orderBy: { periodMonth: 'desc' },
                skip,
                take: limit,
            }),
            prisma.receipt.count({ where: whereBase }),
        ]);

        const formatted = receipts.map(r => ({
            id:            r.id,
            receiptRef:    r.receiptRef,
            periodMonth:   r.periodMonth,
            rentAmount:    Number(r.rentAmount),
            chargesAmount: Number(r.chargesAmount ?? 0),
            totalAmount:   Number(r.totalAmount ?? r.rentAmount),
            status:        r.status,
            paymentMethod: r.paymentMethod,
            paidAt:        r.paidAt?.toISOString() ?? null,
            qrToken:       r.qrToken,
            property:      r.lease.property?.name ?? r.lease.property?.address ?? 'Bien',
            tenant:        r.lease.tenant
                             ? `${r.lease.tenant.firstName ?? ''} ${r.lease.tenant.lastName ?? ''}`.trim()
                             : 'Locataire',
            leaseReference: r.lease.leaseReference,
        }));

        return NextResponse.json({
            receipts: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            currency: 'FCFA',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/receipts GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

/**
 * POST /api/mobile/proprietaire/receipts
 * Émet une nouvelle quittance pour un bail donné
 *
 * Body: { leaseId, periodMonth, rentAmount, chargesAmount?, paymentMethod, paymentRef?, paidAt? }
 */
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const body = await request.json();
        const { leaseId, periodMonth, rentAmount, chargesAmount, paymentMethod, paymentRef, paidAt } = body;

        if (!leaseId || !periodMonth || !rentAmount || !paymentMethod) {
            return NextResponse.json(
                { error: 'leaseId, periodMonth, rentAmount et paymentMethod sont requis.' },
                { status: 400 }
            );
        }

        // Vérifier que le bail appartient bien au propriétaire
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

        // Contrôle d'ordre chronologique (RG-QUI-ORDRE)
        const derniere = await prisma.receipt.findFirst({
            where: { leaseId, status: 'PAID' },
            orderBy: { periodMonth: 'desc' },
        });
        if (derniere) {
            const [dy, dm] = derniere.periodMonth.split('-').map(Number);
            const [ny, nm] = periodMonth.split('-').map(Number);
            const moisSuivant = new Date(dy, dm - 1 + 1);
            const moisDemande = new Date(ny, nm - 1);
            if (moisDemande < moisSuivant) {
                return NextResponse.json(
                    { error: `Mois ${periodMonth} déjà couvert ou antérieur à la dernière quittance.`, code: 'ORDRE_CHRONOLOGIQUE' },
                    { status: 422 }
                );
            }
        }

        const rentNum    = Number(rentAmount);
        const charges    = Number(chargesAmount ?? 0);
        const total      = rentNum + charges;
        const PRIX_QUI   = Number(process.env.QAPRIL_QUITTANCE_PRIX_FCFA ?? 90);
        const ref        = `REC-${periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const sha256Hash = createHash('sha256')
            .update(JSON.stringify({ leaseId, total, ref }))
            .digest('hex');

        // Débit wallet propriétaire
        await prisma.userWalletConfig.upsert({
            where:  { userId: user.userId },
            create: { userId: user.userId, walletBalance: -PRIX_QUI },
            update: { walletBalance: { decrement: PRIX_QUI } },
        });

        const receipt = await prisma.receipt.create({
            data: {
                receiptRef:    ref,
                leaseId,
                periodMonth,
                rentAmount:    rentNum,
                chargesAmount: charges,
                totalAmount:   total,
                paymentMethod,
                paymentRef:    paymentRef ?? null,
                paidAt:        paidAt ? new Date(paidAt) : new Date(),
                qrToken:       randomUUID(),
                receiptHash:   sha256Hash,
                status:        'PAID',
            },
        });

        return NextResponse.json({
            success:    true,
            message:    'Quittance émise avec succès.',
            receiptId:  receipt.id,
            receiptRef: receipt.receiptRef,
            sha256:     sha256Hash,
            currency:   'FCFA',
        }, { status: 201 });

    } catch (error: any) {
        console.error('[MOBILE] proprietaire/receipts POST error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
