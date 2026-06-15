import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/reports
 * Comptes rendus de gestion (CRG) — Rapports mensuels financiers
 *
 * Query: period? (YYYY-MM), leaseId?, page?, limit?
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period  = searchParams.get('period') ?? undefined;
        const leaseId = searchParams.get('leaseId') ?? undefined;
        const limit   = Math.min(24, parseInt(searchParams.get('limit') ?? '12'));

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (leaseId) landlordWhere.id = leaseId;

        // Récupération des quittances groupées par mois
        const receipts = await prisma.receipt.findMany({
            where: {
                status: 'PAID',
                lease:  landlordWhere,
                ...(period ? { periodMonth: period } : {}),
            },
            include: {
                lease: {
                    select: {
                        rentAmount:   true,
                        chargesAmount: true,
                        leaseReference: true,
                        property: { select: { name: true, address: true, commune: true } },
                        tenant:   { select: { firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { periodMonth: 'desc' },
            take: limit * 10, // Enough data to build monthly aggregates
        });

        // Agréger par mois
        const byMonth: Record<string, any> = {};
        for (const r of receipts) {
            const m = r.periodMonth;
            if (!byMonth[m]) {
                byMonth[m] = {
                    period:          m,
                    totalGross:      0,
                    totalCharges:    0,
                    agencyFee:       0,
                    tva:             0,
                    netPayout:       0,
                    receiptsCount:   0,
                    receipts:        [],
                };
            }
            const gross = Number(r.totalAmount ?? r.rentAmount);
            byMonth[m].totalGross    += gross;
            byMonth[m].receiptsCount += 1;
            byMonth[m].receipts.push({
                id:         r.id,
                receiptRef: r.receiptRef,
                amount:     gross,
                property:   r.lease.property?.name ?? r.lease.property?.address ?? 'Bien',
                tenant:     r.lease.tenant
                              ? `${r.lease.tenant.firstName ?? ''} ${r.lease.tenant.lastName ?? ''}`.trim()
                              : 'Locataire',
                leaseRef:   r.lease.leaseReference,
                paidAt:     r.paidAt?.toISOString() ?? null,
            });
        }

        // Calcul commission + TVA
        const COMMISSION_RATE = 0.08; // 8% commission agence
        const TVA_RATE        = 0.18; // 18% TVA
        const reports = Object.values(byMonth)
            .sort((a: any, b: any) => b.period.localeCompare(a.period))
            .slice(0, limit)
            .map((m: any) => {
                const commission = m.totalGross * COMMISSION_RATE;
                const tva        = commission * TVA_RATE;
                const net        = m.totalGross - commission - tva;
                return {
                    ...m,
                    agencyFee:  Math.round(commission),
                    tva:        Math.round(tva),
                    netPayout:  Math.round(net),
                };
            });

        // KPIs globaux
        const totalGross    = reports.reduce((acc: number, r: any) => acc + r.totalGross, 0);
        const totalNetPayout = reports.reduce((acc: number, r: any) => acc + r.netPayout, 0);

        return NextResponse.json({
            reports,
            kpis: {
                totalGross,
                totalNetPayout,
                periodsCount: reports.length,
            },
            currency: 'FCFA',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/reports GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
