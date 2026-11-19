import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/v1/leases/active
 * Retourne le bail actif UNIQUEMENT s'il est validé et signé des deux parties.
 * Si un bail est en attente de signature, retourne pendingLease.
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        // 1. Rechercher strictement un bail actif validé et signé
        const activeLease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE',
            },
            include: {
                property: true,
                landlord: {
                    select: { firstName: true, lastName: true, phone: true }
                },
                occupants: true,
                receipts: {
                    where: { status: { in: ['PAID', 'paid'] } },
                    orderBy: { periodMonth: 'desc' },
                    take: 6
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (activeLease) {
            return NextResponse.json({
                success: true,
                hasLease: true,
                lease: {
                    id: activeLease.id,
                    leaseReference: activeLease.leaseReference,
                    property: activeLease.property,
                    landlord: activeLease.landlord,
                    startDate: activeLease.startDate,
                    durationMonths: activeLease.durationMonths || 12,
                    rentAmount: activeLease.rentAmount,
                    depositAmount: activeLease.depositAmount,
                    chargesAmount: activeLease.chargesAmount,
                    preavisRequisMois: activeLease.preavisRequisMois || 3,
                    statutDgi: activeLease.statutDgi,
                    dgiReference: activeLease.dgiReference,
                    status: activeLease.status,
                    bailleurMasque: activeLease.bailleurMasque,
                },
                occupants: activeLease.occupants || [],
                history: activeLease.receipts || [],
                pendingLease: null
            });
        }

        // 2. Si aucun bail actif signé, vérifier s'il existe un bail initié en attente de validation/signature
        const pendingLease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'PENDING_SIGNATURE'
            },
            include: {
                property: true,
                landlord: {
                    select: { firstName: true, lastName: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            hasLease: false,
            lease: null,
            occupants: [],
            history: [],
            pendingLease: pendingLease ? {
                id: pendingLease.id,
                leaseReference: pendingLease.leaseReference,
                propertyName: pendingLease.property?.name || pendingLease.property?.address || 'Logement',
                propertyAddress: pendingLease.property?.address || '',
                propertyCommune: pendingLease.property?.commune || 'Abidjan',
                rentAmount: pendingLease.rentAmount,
                depositAmount: pendingLease.depositAmount,
                landlordName: `${pendingLease.landlord?.firstName || ''} ${pendingLease.landlord?.lastName || ''}`.trim() || 'Le bailleur',
                status: 'PENDING_SIGNATURE'
            } : null
        });

    } catch (error) {
        console.error("[MOBILE API] v1/leases/active error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
