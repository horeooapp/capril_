import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const leases = await prisma.lease.findMany({
            where: { landlordId: token },
            include: {
                tenant: true,
                property: true
            }
        });

        const tenants = leases.map(l => ({
            id: l.tenantId,
            leaseId: l.id,
            name: `${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''}`.trim() || 'Locataire',
            phone: l.tenant?.phone || 'N/A',
            propertyAddress: l.property?.address || 'Bien Inconnu',
            status: l.status,
            rent: l.rentAmount
        }));

        return NextResponse.json({ success: true, tenants });

    } catch (error: any) {
        console.error("Erreur API Tenants Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
