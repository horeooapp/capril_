import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                kycLevel: true,
                kycStatus: true,
            }
        });

        // Récupérer les biens (Properties) du propriétaire
        const properties = await prisma.property.findMany({
            where: {
                OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }]
            },
            include: {
                leases: {
                    where: { status: 'ACTIVE' },
                    include: {
                        tenant: {
                            select: { firstName: true, lastName: true, phone: true }
                        }
                    }
                }
            }
        });

        const totalProperties = properties.length;

        // Calculs des revenus et de l'occupation
        let occupiedCount = 0;
        let expectedRevenue = 0;

        properties.forEach(prop => {
            if (prop.leases && prop.leases.length > 0) {
                occupiedCount++;
                expectedRevenue += prop.leases[0].rentAmount || 0;
            }
        });

        const occupancyRate = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;
        const vacantProperties = Math.max(0, totalProperties - occupiedCount);

        // Encaissements réels du mois en cours
        const currentMonthStr = new Date().toISOString().substring(0, 7);
        const paidReceipts = await prisma.receipt.findMany({
            where: {
                lease: {
                    OR: [
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { landlordId: user.userId } }
                    ]
                },
                periodMonth: currentMonthStr,
                status: { in: ['paid', 'PAID'] }
            },
            select: {
                totalAmount: true,
                rentAmount: true
            }
        });

        const collectedRevenue = paidReceipts.reduce((sum, r) => sum + (r.totalAmount || r.rentAmount || 0), 0);

        const pendingLeasesCount = await prisma.lease.count({
            where: {
                OR: [
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                    { property: { landlordId: user.userId } }
                ],
                status: 'PENDING'
            }
        });

        const incidentsCount = await prisma.ticketMaintenance.count({
            where: {
                logement: {
                    OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }]
                },
                statut: { in: ['NOUVEAU', 'EN_COURS', 'OUVERT'] }
            }
        });

        return NextResponse.json({
            user: userRecord,
            totalProperties,
            occupiedCount,
            occupancyRate,
            monthlyRevenue: expectedRevenue,
            collectedRevenue,
            vacantProperties,
            pendingLeasesCount,
            incidentsCount,
            currency: 'XOF'
        });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
