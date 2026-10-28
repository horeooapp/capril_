import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/wallet
 * Porte-monnaie du propriétaire : solde, revenus, historique complet
 *
 * Query: page?, limit?
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

        // Solde wallet
        const walletConfig = await prisma.userWalletConfig.findUnique({
            where: { userId: user.userId },
            select: { walletBalance: true, landlordCode: true },
        });

        const landlordWhere = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };

        // Agréger les revenus totaux
        const [totalRevenue, receiptsCount] = await Promise.all([
            prisma.receipt.aggregate({
                where: { status: 'PAID', lease: landlordWhere },
                _sum: { totalAmount: true },
            }),
            prisma.receipt.count({
                where: { status: 'PAID', lease: landlordWhere },
            }),
        ]);

        // Transactions récentes
        const receipts = await prisma.receipt.findMany({
            where: { status: 'PAID', lease: landlordWhere },
            include: {
                lease: {
                    select: {
                        leaseReference: true,
                        property: { select: { name: true, commune: true } },
                        tenant:   { select: { firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { paidAt: 'desc' },
            skip,
            take: limit,
        });

        const transactions = receipts.map(r => ({
            id:           r.id,
            type:         'CREDIT',
            label:        `Loyer ${r.periodMonth}`,
            amount:       Number(r.totalAmount ?? r.rentAmount),
            date:         r.paidAt?.toISOString() ?? r.createdAt?.toISOString() ?? null,
            periodMonth:  r.periodMonth,
            paymentMethod:r.paymentMethod,
            receiptRef:   r.receiptRef,
            property:     r.lease.property?.name ?? 'Bien',
            commune:      r.lease.property?.commune ?? '',
            tenant:       r.lease.tenant
                            ? `${r.lease.tenant.firstName ?? ''} ${r.lease.tenant.lastName ?? ''}`.trim()
                            : 'Locataire',
        }));

        // Revenus par mois (6 derniers mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await prisma.receipt.groupBy({
            by: ['periodMonth'],
            where: {
                status:  'PAID',
                lease:   landlordWhere,
                paidAt: { gte: sixMonthsAgo },
            },
            _sum: { totalAmount: true },
            orderBy: { periodMonth: 'desc' },
        });

        return NextResponse.json({
            balance:          Number(walletConfig?.walletBalance ?? 0),
            landlordCode:     walletConfig?.landlordCode ?? null,
            totalRevenue:     Number(totalRevenue._sum.totalAmount ?? 0),
            receiptsCount,
            transactions,
            monthlyRevenue:   monthlyRevenue.map(m => ({
                month:  m.periodMonth,
                amount: Number(m._sum.totalAmount ?? 0),
            })),
            pagination: {
                page,
                limit,
                total: receiptsCount,
                pages: Math.ceil(receiptsCount / limit),
            },
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/wallet GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
