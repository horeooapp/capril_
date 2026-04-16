import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { PasseportService } from '@/lib/passport-service';
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

        const leases = await prisma.lease.findMany({
            where: { landlordId: userId },
            include: {
                tenant: true,
                property: true
            }
        });

        const tenants = await Promise.all(leases.filter(l => l.tenantId).map(async (l) => {
            const summary = await PasseportService.getTenantReliabilitySummary(l.tenantId!);
            return {
                id: l.tenantId,
                leaseId: l.id,
                name: `${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''}`.trim() || 'Locataire',
                phone: l.tenant?.phone || 'N/A',
                propertyAddress: l.property?.address || 'Bien Inconnu',
                status: l.status,
                rent: l.rentAmount,
                reliability: {
                    score: summary.score,
                    badge: summary.badge
                }
            };
        }));

        return NextResponse.json({ success: true, tenants });

    } catch (error: any) {
        console.error("Erreur API Tenants Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
