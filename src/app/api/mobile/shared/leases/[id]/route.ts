import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { calculerDroitsEnregistrement } from '@/lib/lease-validation';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch the full lease with relations
        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: true,
                tenant: {
                    include: {
                        tenantProfile: true
                    }
                },
                tenantEntity: true,
                owner: true,
                propertyAgent: true,
                mandatGestion: true
            }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
        }

        // Verify access: user must be the tenant, owner, or agent
        const isTenant = lease.tenantId === user.userId;
        const isOwner = lease.ownerId === user.userId;
        const isAgent = lease.agentId === user.userId;
        const isPropertyOwner = lease.property?.ownerUserId === user.userId;
        const isPropertyLandlord = (lease.landlordId === user.userId || lease.property?.ownerUserId === user.userId);

        if (!isTenant && !isOwner && !isAgent && !isPropertyOwner && !isPropertyLandlord) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // S-06 : Récapitulatif des droits d'enregistrement calculé avant signature
        const duration = lease.durationMonths || 12;
        const rent = lease.rentAmount || 0;
        const recapitulatifDroitsEnregistrement = calculerDroitsEnregistrement(rent, duration);

        return NextResponse.json({ 
            lease: {
                ...lease,
                recapitulatifDroitsEnregistrement,
                droitsDgiCalcules: lease.droitsDgiCalcules || recapitulatifDroitsEnregistrement.totalDroitsDgi,
            },
            recapitulatifDroitsEnregistrement
        });
    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id] error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
