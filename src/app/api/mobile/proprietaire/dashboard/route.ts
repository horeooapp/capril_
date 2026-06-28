import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        // Récupérer les biens (Properties) du propriétaire
        const properties = await prisma.property.findMany({
            where: {
                OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }]
            },
            include: {
                leases: {
                    where: { status: 'ACTIVE' }
                }
            }
        });

        const totalProperties = properties.length;
        
        if (totalProperties === 0) {
            return NextResponse.json({
                totalProperties: 0,
                occupancyRate: 0,
                monthlyRevenue: 0,
                vacantProperties: 0
            });
        }

        // Calculs basiques
        let occupiedCount = 0;
        let expectedRevenue = 0;

        properties.forEach(prop => {
            if (prop.leases && prop.leases.length > 0) {
                occupiedCount++;
                expectedRevenue += prop.leases[0].rentAmount || 0;
            }
        });

        const occupancyRate = Math.round((occupiedCount / totalProperties) * 100);
        const vacantProperties = totalProperties - occupiedCount;

        const pendingLeasesCount = await prisma.bailDeclaratif.count({
            where: {
                bailleurId: user.userId,
                statut: 'PENDING_LOCATAIRE'
            }
        });

        const incidentsCount = await prisma.reclamationLocataire.count({
            where: {
                lease: {
                    property: {
                        OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }]
                    }
                },
                statut: { in: ['OUVERT', 'EN_COURS'] }
            }
        });

        return NextResponse.json({
            totalProperties,
            occupancyRate,
            monthlyRevenue: expectedRevenue,
            vacantProperties,
            pendingLeasesCount,
            incidentsCount,
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
