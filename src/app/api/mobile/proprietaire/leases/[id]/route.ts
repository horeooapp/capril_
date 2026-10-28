import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/leases/[id]
 * Détail complet d'un bail
 *
 * PATCH /api/mobile/proprietaire/leases/[id]
 * Mise à jour partielle (ex: renouvellement, montant loyer)
 * Body: { rentAmount?, chargesAmount?, durationMonths?, endDate?, status? }
 */

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id } = await params;

        const lease = await prisma.lease.findFirst({
            where: {
                id,
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                    { tenantId: user.userId },
                ],
            },
            include: {
                property: {
                    include: { images: { where: { isMain: true }, take: 1 } },
                },
                landlord: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                tenant:   { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                receipts: {
                    orderBy: { periodMonth: 'desc' },
                    take: 6,
                    select: {
                        id:           true,
                        receiptRef:   true,
                        periodMonth:  true,
                        status:       true,
                        totalAmount:  true,
                        paidAt:       true,
                    },
                },
            },
        });

        if (!lease) {
            return NextResponse.json({ error: 'Bail introuvable ou accès refusé.' }, { status: 404 });
        }

        return NextResponse.json({
            id:               lease.id,
            leaseReference:   lease.leaseReference,
            status:           lease.status,
            leaseType:        lease.leaseType,
            typeBail:         lease.typeBail,
            startDate:        lease.startDate?.toISOString() ?? null,
            endDate:          lease.endDate?.toISOString() ?? null,
            durationMonths:   lease.durationMonths,
            rentAmount:       Number(lease.rentAmount),
            chargesAmount:    Number(lease.chargesAmount ?? 0),
            depositAmount:    Number(lease.depositAmount ?? 0),
            avanceLoyer:      Number(lease.avanceLoyer ?? 0),
            preavisRequisMois: lease.preavisRequisMois,
            sha256Hash:       lease.sha256Hash,
            isSignedElec:     lease.isSignedElectronically,
            signedAt:         lease.signedAt?.toISOString() ?? null,
            property: {
                id:           lease.property?.id,
                name:         lease.property?.name ?? 'Bien sans nom',
                address:      lease.property?.address ?? '',
                commune:      lease.property?.commune ?? '',
                propertyCode: lease.property?.propertyCode ?? '',
                imageUrl:     lease.property?.images?.[0]?.s3Key ?? null,
            },
            landlord: lease.landlord,
            tenant:   lease.tenant,
            receipts: lease.receipts.map(r => ({
                id:          r.id,
                receiptRef:  r.receiptRef,
                periodMonth: r.periodMonth,
                status:      r.status,
                totalAmount: Number(r.totalAmount ?? 0),
                paidAt:      r.paidAt?.toISOString() ?? null,
            })),
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/leases/[id] GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { id } = await params;

        // Seul le propriétaire peut modifier
        const lease = await prisma.lease.findFirst({
            where: {
                id,
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                ],
            },
        });
        if (!lease) {
            return NextResponse.json({ error: 'Bail introuvable ou accès refusé.' }, { status: 404 });
        }

        const body = await request.json();
        const allowed = ['rentAmount', 'chargesAmount', 'depositAmount', 'durationMonths', 'endDate', 'preavisRequisMois'];
        const updateData: any = {};
        for (const key of allowed) {
            if (body[key] !== undefined) {
                updateData[key] = key.includes('Date') ? new Date(body[key]) : Number(body[key]);
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Aucun champ modifiable fourni.' }, { status: 400 });
        }

        const updated = await prisma.lease.update({
            where: { id },
            data:  updateData,
        });

        return NextResponse.json({ success: true, leaseId: updated.id });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/leases/[id] PATCH error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
