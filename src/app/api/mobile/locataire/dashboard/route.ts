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

        if (!lease) {
            return NextResponse.json({
                hasLease: false,
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

        return NextResponse.json({
            hasLease: true,
            propertyName: propertyName,
            currentRentAmount: currentRentAmount,
            rentStatus: rentStatus,
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
