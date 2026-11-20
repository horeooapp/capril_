import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/v1/leases/active
 * Retourne le bail actif UNIQUEMENT s'il est validé et signé des deux parties.
 * Si un bail est en attente de signature, retourne pendingLease.
 */
/**
 * [IC-09] Bail que ce locataire doit signer : retrouvé par son compte ou par son numéro, dans tous les
 * états d'attente (y compris un bail né d'une quittance express, dès qu'un code est en cours).
 */
async function trouverBailASigner(userId: string, sauf?: string) {
    const moi = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
    return prisma.lease.findFirst({
        where: {
            deletedAt: null,
            isSignedElectronically: false,
            ...(sauf ? { id: { not: sauf } } : {}),
            AND: [
                { OR: [{ tenantId: userId }, ...(moi?.phone ? [{ tenant: { phone: moi.phone } }] : [])] },
                { OR: [
                    { status: { in: ['PENDING_SIGNATURE', 'PENDING_CONFIRMATION', 'DRAFT'] } },
                    { status: 'ACTIVE_DECLARATIF', signingOtpHash: { not: null } },
                ] },
            ],
        } as any,
        include: { property: true, landlord: { select: { firstName: true, lastName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
    });
}

function resumeBailASigner(b: any) {
    if (!b) return null;
    return {
        id: b.id,
        leaseReference: b.leaseReference,
        propertyName: b.property?.name || b.property?.address || 'Logement',
        propertyAddress: b.property?.address || '',
        propertyCommune: b.property?.commune || 'Abidjan',
        rentAmount: b.rentAmount,
        depositAmount: b.depositAmount,
        landlordName: `${b.landlord?.firstName || ''} ${b.landlord?.lastName || ''}`.trim() || 'Le bailleur',
        status: 'PENDING_SIGNATURE',
    };
}

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        // 1. Rechercher strictement un bail actif validé et signé bilatéralement
        const activeLease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE',
                isSignedElectronically: true,
                signedAt: { not: null },
                deletedAt: null,
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
                pendingLease: resumeBailASigner(await trouverBailASigner(user.userId, activeLease.id))
            });
        }

        // 2. Si aucun bail actif signé, vérifier s'il existe un bail initié en attente de validation/signature
        const pendingLease = await trouverBailASigner(user.userId);

        return NextResponse.json({
            success: true,
            hasLease: false,
            lease: null,
            occupants: [],
            history: [],
            pendingLease: resumeBailASigner(pendingLease)
        });

    } catch (error) {
        console.error("[MOBILE API] v1/leases/active error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
