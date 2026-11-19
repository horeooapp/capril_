import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/v1/leases
 * Liste des baux pour bailleur / agence avec statut de signature bilatérale
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const leases = await prisma.lease.findMany({
            where: {
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                    { property: { managedByUserId: user.userId } },
                    { agentId: user.userId }
                ],
                status: { notIn: ['CANCELLED', 'ARCHIVED'] },
                deletedAt: null
            },
            include: {
                property: { select: { id: true, name: true, address: true, commune: true, propertyCode: true, unitLabel: true } },
                tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                mandatGestion: { select: { id: true, statut: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = leases.map(l => ({
            id: l.id,
            leaseReference: l.leaseReference,
            status: l.status,
            leaseType: l.leaseType,
            rentAmount: l.rentAmount,
            chargesAmount: l.chargesAmount,
            depositAmount: l.depositAmount,
            startDate: l.startDate,
            endDate: l.endDate,
            statutDgi: l.statutDgi,
            dgiReference: l.dgiReference,
            bailleurMasque: l.bailleurMasque,
            isSignedElectronically: l.isSignedElectronically,
            signedAt: l.signedAt,
            property: l.property,
            tenant: l.tenant,
            sousMandat: Boolean(l.mandatGestion && l.mandatGestion.statut === 'ACTIF')
        }));

        return NextResponse.json({ success: true, leases: formatted });
    } catch (error) {
        console.error("[MOBILE API] v1/leases error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
