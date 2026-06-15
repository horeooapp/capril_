import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/leases
 * Liste les baux du propriétaire
 *
 * Query params:
 *   - status : filtrer par statut (ex: ACTIVE, DRAFT, TERMINATED...)
 *   - propertyId : filtrer par bien
 *   - page, limit
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status     = searchParams.get('status') ?? undefined;
        const propertyId = searchParams.get('propertyId') ?? undefined;
        const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip       = (page - 1) * limit;

        const where: any = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };
        if (status)     where.status     = status;
        if (propertyId) where.propertyId = propertyId;

        const [leases, total] = await Promise.all([
            prisma.lease.findMany({
                where,
                include: {
                    property: { select: { id: true, name: true, address: true, commune: true, propertyCode: true } },
                    tenant:   { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                    receipts: {
                        orderBy: { periodMonth: 'desc' },
                        take: 1,
                        select: { periodMonth: true, status: true },
                    },
                },
                orderBy: { startDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.lease.count({ where }),
        ]);

        const formatted = leases.map(l => ({
            id:             l.id,
            leaseReference: l.leaseReference,
            status:         l.status,
            leaseType:      l.leaseType,
            typeBail:       l.typeBail,
            startDate:      l.startDate?.toISOString() ?? null,
            endDate:        l.endDate?.toISOString() ?? null,
            durationMonths: l.durationMonths,
            rentAmount:     Number(l.rentAmount),
            chargesAmount:  Number(l.chargesAmount ?? 0),
            depositAmount:  Number(l.depositAmount ?? 0),
            avanceLoyer:    Number(l.avanceLoyer ?? 0),
            property: {
                id:           l.property?.id,
                name:         l.property?.name ?? 'Bien sans nom',
                address:      l.property?.address ?? '',
                commune:      l.property?.commune ?? '',
                propertyCode: l.property?.propertyCode ?? '',
            },
            tenant: l.tenant ? {
                id:        l.tenant.id,
                firstName: l.tenant.firstName,
                lastName:  l.tenant.lastName,
                phone:     l.tenant.phone,
                email:     l.tenant.email,
            } : null,
            lastReceipt: l.receipts[0] ?? null,
            currency: 'FCFA',
        }));

        return NextResponse.json({
            leases: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/leases GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
