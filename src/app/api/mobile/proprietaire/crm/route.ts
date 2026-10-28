import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/crm
 * Fiche CRM des locataires du propriétaire : historique, solvabilité, incidents
 *
 * Query: leaseId?, tenantId?, page?, limit?
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaseId  = searchParams.get('leaseId') ?? undefined;
        const tenantId = searchParams.get('tenantId') ?? undefined;
        const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit    = Math.min(20, parseInt(searchParams.get('limit') ?? '10'));
        const skip     = (page - 1) * limit;

        const landlordWhere: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
            tenantId: { not: null },
        };
        if (leaseId)  landlordWhere.id       = leaseId;
        if (tenantId) landlordWhere.tenantId = tenantId;

        const leases = await prisma.lease.findMany({
            where: landlordWhere,
            include: {
                tenant: {
                    select: {
                        id:        true,
                        firstName: true,
                        lastName:  true,
                        phone:     true,
                        email:     true,
                        kycLevel:  true,
                        kycStatus: true,
                        createdAt: true,
                    },
                },
                property: { select: { name: true, address: true, commune: true } },
                receipts: {
                    select: {
                        status:      true,
                        periodMonth: true,
                        totalAmount: true,
                        paidAt:      true,
                    },
                },
                reclamations: {
                    select: { statut: true, objet: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                },
            },
            orderBy: { startDate: 'desc' },
            skip,
            take: limit,
        });

        const fiches = leases.map(l => {
            const receipts = l.receipts ?? [];
            const paid     = receipts.filter(r => r.status === 'PAID');
            const unpaid   = receipts.filter(r => r.status !== 'PAID');
            const payRate  = receipts.length > 0 ? Math.round((paid.length / receipts.length) * 100) : 100;
            const totalPaid = paid.reduce((acc, r) => acc + Number(r.totalAmount ?? 0), 0);

            // Score de solvabilité simplifié (0-100)
            let solvabilityScore = 100;
            if (unpaid.length > 0)       solvabilityScore -= unpaid.length * 10;
            if (l.reclamations.length > 0) solvabilityScore -= l.reclamations.length * 5;
            solvabilityScore = Math.max(0, Math.min(100, solvabilityScore));

            return {
                leaseId:        l.id,
                leaseReference: l.leaseReference,
                leaseStatus:    l.status,
                startDate:      l.startDate?.toISOString() ?? null,
                rentAmount:     Number(l.rentAmount),
                property:       l.property?.name ?? l.property?.address ?? 'Bien',
                tenant: l.tenant ? {
                    id:         l.tenant.id,
                    firstName:  l.tenant.firstName,
                    lastName:   l.tenant.lastName,
                    phone:      l.tenant.phone,
                    email:      l.tenant.email,
                    kycLevel:   l.tenant.kycLevel,
                    kycStatus:  l.tenant.kycStatus,
                    memberSince: l.tenant.createdAt?.toISOString() ?? null,
                } : null,
                payment: {
                    totalReceipts:   receipts.length,
                    paidCount:       paid.length,
                    unpaidCount:     unpaid.length,
                    paymentRate:     payRate,
                    totalPaidAmount: totalPaid,
                },
                solvabilityScore,
                solvabilityLabel: solvabilityScore >= 80 ? 'EXCELLENT' : solvabilityScore >= 60 ? 'BON' : solvabilityScore >= 40 ? 'MOYEN' : 'RISQUE',
                recentIncidents: (l.reclamations ?? []).map(r => ({
                    statut:    r.statut,
                    objet:     r.objet,
                    createdAt: r.createdAt?.toISOString() ?? null,
                })),
                currency: 'XOF',
            };
        });

        return NextResponse.json({
            fiches,
            pagination: { total: leases.length, page, limit },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/crm GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
