import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou manquant." }, { status: 401 });
        }

        // Récupérer le bail (Lease) actif du locataire
        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE' // Suppose que 'ACTIVE' est le statut d'un bail en cours
            },
            include: {
                property: true
            }
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
        const propertyName = lease.property?.name || 'Votre logement';

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

        // Fetch recent receipts
        const recentReceipts = await prisma.receipt.findMany({
            where: { leaseId: lease.id },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
                id: true,
                periodMonth: true,
                status: true,
                amount: true
            }
        });

        // Count open maintenance requests
        const openMaintenanceCount = await prisma.reclamationLocataire.count({
            where: {
                tenantId: user.userId,
                statut: { in: ['OUVERT', 'EN_COURS'] }
            }
        });

        // Calculate next payment date (typically 5th of next month)
        const now = new Date();
        let nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        if (now.getDate() > 5) {
            // If we are past the 5th, the next payment is next month
        } else {
            // If we are before the 5th, the next payment is this month
            nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), 5);
        }

        return NextResponse.json({
            hasLease: true,
            propertyName: propertyName,
            currentRentAmount: currentRentAmount,
            rentStatus: rentStatus,
            currency: 'FCFA',
            recentReceipts: recentReceipts,
            openMaintenanceCount: openMaintenanceCount,
            nextPaymentDate: nextPaymentDate.toISOString(),
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
