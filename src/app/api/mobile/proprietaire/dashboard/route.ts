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
                OR: [{ ownerUserId: user.userId }, { managedByUserId: user.userId }]
            },
            include: {
                leases: {
                    where: { status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] } },
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
                        { property: { managedByUserId: user.userId } }
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
                    { property: { managedByUserId: user.userId } }
                ],
                status: { in: ['PENDING_SIGNATURE', 'PENDING_CONFIRMATION', 'PENDING_DEPOSIT'] }
            }
        });

        const incidentsCount = await prisma.ticketMaintenance.count({
            where: {
                OR: [
                    { lease: { landlordId: user.userId } },
                    { logement: { ownerUserId: user.userId } },
                    { logement: { managedByUserId: user.userId } }
                ],
                statut: { in: ['EN_ATTENTE', 'PRIS_EN_CHARGE'] }
            }
        });

        // Déclarations locataires à confirmer (P0-03)
        const pendingTenantDeclarationsRaw = await prisma.bailDeclaratif.findMany({
            where: {
                OR: [
                    { bailleurId: user.userId },
                    ...(userRecord?.phone ? [{ telephoneLocataire: { not: userRecord.phone }, bailleur: { phone: userRecord.phone } }] : [])
                ],
                sourceCreation: 'TENANT_DECLARATION',
                statut: 'PENDING_LOCATAIRE'
            },
            include: {
                locataire: {
                    select: { firstName: true, lastName: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const pendingTenantDeclarations = pendingTenantDeclarationsRaw.map(d => ({
            id: d.id,
            tenantName: d.nomLocataireDeclare || `${d.locataire?.firstName || ''} ${d.locataire?.lastName || ''}`.trim() || 'Locataire',
            tenantPhone: d.telephoneLocataire || d.locataire?.phone || '',
            housingDesc: d.descriptionLogement,
            rentAmount: d.loyerDeclareMensuel,
            createdAt: d.createdAt
        }));

        // Déclarations de paiements à confirmer (P0-05)
        const pendingPaymentsRaw = await prisma.declarationPaiement.findMany({
            where: {
                bail: {
                    OR: [
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { managedByUserId: user.userId } }
                    ]
                },
                statut: 'DECLARE'
            },
            include: {
                locataire: {
                    select: { firstName: true, lastName: true, phone: true }
                },
                bail: {
                    include: {
                        property: {
                            select: { name: true, address: true, commune: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const pendingPaymentDeclarations = pendingPaymentsRaw.map(p => ({
            id: p.id,
            tenantName: `${p.locataire?.firstName || ''} ${p.locataire?.lastName || ''}`.trim() || 'Locataire',
            tenantPhone: p.locataire?.phone || '',
            propertyName: p.bail?.property?.name || p.bail?.property?.address || 'Logement',
            amount: p.montant,
            paymentMethod: p.moyen,
            date: p.datePaiement,
            month: p.mois,
            preuveUrl: p.preuveUrl,
            leaseId: p.bailId,
            createdAt: p.createdAt
        }));

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
            pendingTenantDeclarations,
            pendingPaymentDeclarations,
            currency: 'XOF'
        });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
