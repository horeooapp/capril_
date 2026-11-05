import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou manquant." }, { status: 401 });
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

        // Récupérer le bail (Lease) actif du locataire
        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE'
            },
            include: {
                property: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch pending lease (BailDeclaratif) for the tenant
        const pendingLease = await prisma.bailDeclaratif.findFirst({
            where: {
                locataireId: user.userId,
                statut: 'PENDING_LOCATAIRE'
            },
            include: {
                property: true
            }
        });

        if (!lease) {
            return NextResponse.json({
                hasLease: false,
                user: userRecord,
                pendingLease: pendingLease ? {
                    id: pendingLease.id,
                    propertyName: pendingLease.property?.name || 'Logement',
                    rentAmount: pendingLease.montantLoyer,
                    status: pendingLease.statut
                } : null,
                message: "Aucun bail actif trouvé."
            });
        }

        const currentRentAmount = lease.rentAmount || 0;
        const depositAmount = lease.depositAmount || currentRentAmount * 2;
        const propertyName = lease.property?.name || 'Votre logement';
        const propertyCommune = lease.property?.commune || '';
        const propertyAddress = lease.property?.address || '';

        // Check landlord information
        let landlordName = 'Bailleur';
        let landlordPhone: string | null = null;
        const landlordIdToFind = lease.landlordId || lease.property?.ownerUserId;
        if (landlordIdToFind) {
            const landlord = await prisma.user.findUnique({
                where: { id: landlordIdToFind },
                select: { firstName: true, lastName: true, phone: true }
            });
            if (landlord) {
                landlordName = lease.bailleurMasque 
                    ? 'Bailleur certifié' 
                    : `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Bailleur';
                landlordPhone = lease.bailleurMasque ? null : landlord.phone;
            }
        }

        // Check if there is a receipt for the current month
        const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
        const currentReceipt = await prisma.receipt.findFirst({
            where: {
                leaseId: lease.id,
                periodMonth: currentMonthStr
            }
        });
        
        let rentStatus = 'PENDING';
        if (currentReceipt) {
            rentStatus = currentReceipt.status === 'paid' || currentReceipt.status === 'PAID' ? 'PAID' : 'PENDING';
        }

        // Fetch recent receipts & punctuality stats
        const [recentReceipts, totalReceiptsCount, paidReceiptsCount] = await Promise.all([
            prisma.receipt.findMany({
                where: { leaseId: lease.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    receiptRef: true,
                    periodMonth: true,
                    status: true,
                    totalAmount: true,
                    rentAmount: true,
                    paymentMethod: true,
                    receiptHash: true,
                    paidAt: true,
                    createdAt: true
                }
            }),
            prisma.receipt.count({ where: { leaseId: lease.id } }),
            prisma.receipt.count({ where: { leaseId: lease.id, status: { in: ['paid', 'PAID'] } } })
        ]);
        
        const mappedReceipts = recentReceipts.map(r => ({
            id: r.id,
            receiptRef: r.receiptRef,
            periodMonth: r.periodMonth,
            status: r.status,
            amount: r.totalAmount || r.rentAmount || 0,
            paymentMethod: r.paymentMethod,
            receiptHash: r.receiptHash,
            paidAt: r.paidAt || r.createdAt
        }));

        // Count open maintenance requests
        const openMaintenanceCount = await prisma.ticketMaintenance.count({
            where: {
                locataireId: user.userId,
                statut: { in: ['NOUVEAU', 'EN_COURS', 'OUVERT'] }
            }
        });

        // Calculate next payment date
        const now = new Date();
        const paymentDay = lease.paymentDay || 5;
        let nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);
        if (now.getDate() > paymentDay) {
            nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, paymentDay);
        }

        return NextResponse.json({
            hasLease: true,
            user: userRecord,
            lease: {
                id: lease.id,
                leaseReference: lease.leaseReference,
                startDate: lease.startDate,
                endDate: lease.endDate,
                durationMonths: lease.durationMonths,
                paymentDay: lease.paymentDay,
                depositAmount: depositAmount,
                status: lease.status
            },
            propertyName,
            propertyCommune,
            propertyAddress,
            landlordName,
            landlordPhone,
            currentRentAmount,
            depositAmount,
            rentStatus,
            totalReceiptsCount,
            paidReceiptsCount,
            currency: 'XOF',
            recentReceipts: mappedReceipts,
            openMaintenanceCount,
            nextPaymentDate: nextPaymentDate.toISOString(),
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
