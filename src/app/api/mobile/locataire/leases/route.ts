import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' },
            include: { property: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!lease) {
            return NextResponse.json({ error: "Aucun bail trouvé" }, { status: 404 });
        }

        return NextResponse.json({
            id: lease.id,
            leaseReference: lease.leaseReference,
            property: lease.property?.name || 'Votre logement',
            startDate: lease.startDate,
            endDate: lease.endDate,
            rentAmount: lease.rentAmount,
            depositAmount: lease.depositAmount,
            status: lease.status,
            documentUrl: lease.qrCodeUrl || `/api/mobile/leases/${lease.id}/pdf`
        });

    } catch (error) {
        console.error("[MOBILE API] locataire/leases error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
