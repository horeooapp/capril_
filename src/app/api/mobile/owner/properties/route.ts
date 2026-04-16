import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        const properties = await prisma.property.findMany({
            where: { ownerUserId: userId },
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'LOYER_IMPAYE'] } },
                    include: { tenant: true }
                }
            }
        });

        // Calcul des métriques
        const formatted = properties.map(p => {
            const activeLease = p.leases[0];
            return {
                id: p.id,
                propertyCode: p.propertyCode,
                propertyType: p.propertyType,
                address: p.address,
                commune: p.commune,
                status: activeLease ? 'Occupé' : 'Vacant',
                tenantName: activeLease?.tenant ? `${activeLease.tenant.firstName || ''} ${activeLease.tenant.lastName || ''}`.trim() : null,
                rent: activeLease?.rentAmount || 0,
                leaseStatus: activeLease?.status
            };
        });

        return NextResponse.json({ success: true, properties: formatted });

    } catch (error: any) {
        console.error("Erreur API Owner Properties:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
