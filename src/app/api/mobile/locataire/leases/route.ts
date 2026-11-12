import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { calculerEcheanceBail } from '@/lib/echeance';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' },
            include: { 
                property: true,
                receipts: {
                    where: { status: { in: ['PAID', 'paid'] } },
                    select: { periodMonth: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!lease) {
            return NextResponse.json({ error: "Aucun bail trouvé" }, { status: 404 });
        }

        const paidMonths = lease.receipts.map(r => r.periodMonth);
        const echeance = calculerEcheanceBail({
            paymentDay: lease.paymentDay,
            paidMonths,
            startDate: lease.startDate,
        });

        return NextResponse.json({
            id: lease.id,
            leaseReference: lease.leaseReference,
            property: lease.property?.name || 'Votre logement',
            startDate: lease.startDate,
            endDate: lease.endDate,
            rentAmount: lease.rentAmount,
            depositAmount: lease.depositAmount,
            paymentDay: lease.paymentDay || 5,
            status: lease.status,
            documentUrl: lease.qrCodeUrl || `/api/mobile/leases/${lease.id}/pdf`,
            prochaine_echeance_date: echeance.prochaine_echeance_date,
            jours_restants: echeance.jours_restants,
            retard_jours: echeance.retard_jours,
            est_en_retard: echeance.est_en_retard,
            est_jour_j: echeance.est_jour_j,
            texte_echeance: echeance.texte_echeance,
        });

    } catch (error) {
        console.error("[MOBILE API] locataire/leases error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
