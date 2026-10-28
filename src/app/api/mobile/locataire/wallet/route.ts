import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/locataire/wallet
 * Solde et historique des transactions du locataire
 * (paiements de loyer, dépôts de garantie, avances)
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip  = (page - 1) * limit;

        // Wallet config
        const walletConfig = await prisma.userWalletConfig.findUnique({
            where: { userId: user.userId },
            select: { walletBalance: true },
        });

        // Quittances payées par le locataire (historique loyers)
        const receipts = await prisma.receipt.findMany({
            where: {
                lease: { tenantId: user.userId },
                status: 'PAID',
            },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { name: true, address: true } },
                    },
                },
            },
            orderBy: { paidAt: 'desc' },
            skip,
            take: limit,
        });

        const totalPaidQuery = await prisma.receipt.aggregate({
            where: {
                lease: { tenantId: user.userId },
                status: 'PAID',
            },
            _sum:   { totalAmount: true },
            _count: { id: true },
        });

        const transactions = receipts.map(r => ({
            id:           r.id,
            type:         'LOYER',
            label:        `Loyer ${r.periodMonth}`,
            amount:       -Number(r.totalAmount ?? r.rentAmount), // négatif = sortie pour locataire
            date:         r.paidAt?.toISOString() ?? r.createdAt?.toISOString() ?? null,
            periodMonth:  r.periodMonth,
            paymentMethod:r.paymentMethod,
            receiptRef:   r.receiptRef,
            property:     r.lease.property?.name ?? r.lease.property?.address ?? 'Bien',
            leaseRef:     r.lease.leaseReference,
        }));

        // Bail actif pour les montants référence
        const activeLease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'ACTIVE_DECLARATIF'] } },
            select: { rentAmount: true, depositAmount: true, avanceLoyer: true },
        });

        return NextResponse.json({
            balance:       Number(walletConfig?.walletBalance ?? 0),
            totalPaid:     Number(totalPaidQuery._sum.totalAmount ?? 0),
            paymentsCount: totalPaidQuery._count.id,
            activeLease: activeLease ? {
                monthlyRent:    Number(activeLease.rentAmount),
                depositAmount:  Number(activeLease.depositAmount ?? 0),
                avanceLoyer:    Number(activeLease.avanceLoyer ?? 0),
            } : null,
            transactions,
            pagination: {
                page,
                limit,
                total: totalPaidQuery._count.id,
                pages: Math.ceil(totalPaidQuery._count.id / limit),
            },
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] locataire/wallet GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
