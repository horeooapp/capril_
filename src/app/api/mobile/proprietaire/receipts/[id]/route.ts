import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/receipts/[id]
 * Détail d'une quittance (avec lien PDF si disponible)
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

        const receipt = await prisma.receipt.findUnique({
            where: { id },
            include: {
                lease: {
                    include: {
                        property: true,
                        landlord: { select: { firstName: true, lastName: true, phone: true, email: true } },
                        tenant:   { select: { firstName: true, lastName: true, phone: true, email: true } },
                    },
                },
            },
        });

        if (!receipt) {
            return NextResponse.json({ error: 'Quittance introuvable.' }, { status: 404 });
        }

        // Vérification d'accès : propriétaire ou locataire du bail
        const isLandlord = receipt.lease.landlordId === user.userId || receipt.lease.property?.ownerUserId === user.userId;
        const isTenant   = receipt.lease.tenantId === user.userId;
        if (!isLandlord && !isTenant) {
            return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
        }

        return NextResponse.json({
            id:             receipt.id,
            receiptRef:     receipt.receiptRef,
            periodMonth:    receipt.periodMonth,
            rentAmount:     Number(receipt.rentAmount),
            chargesAmount:  Number(receipt.chargesAmount ?? 0),
            totalAmount:    Number(receipt.totalAmount ?? receipt.rentAmount),
            status:         receipt.status,
            paymentMethod:  receipt.paymentMethod,
            paymentRef:     receipt.paymentRef,
            paidAt:         receipt.paidAt?.toISOString() ?? null,
            qrToken:        receipt.qrToken,
            receiptHash:    receipt.receiptHash,
            // Bail & bien
            lease: {
                id:             receipt.lease.id,
                leaseReference: receipt.lease.leaseReference,
                property: {
                    name:    receipt.lease.property?.name,
                    address: receipt.lease.property?.address,
                },
                landlord: isLandlord ? receipt.lease.landlord : undefined,
                tenant:   receipt.lease.tenant,
            },
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/receipts/[id] GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
