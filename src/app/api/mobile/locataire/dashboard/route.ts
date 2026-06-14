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

        // Simuler la logique métier du loyer du mois courant (ou l'extraire de vos modèles)
        // Pour l'instant, on utilise le montant de base du bail.
        const currentRentAmount = lease.rentAmount || 0;
        const propertyName = lease.property?.name || 'Votre logement';

        return NextResponse.json({
            hasLease: true,
            propertyName: propertyName,
            currentRentAmount: currentRentAmount,
            rentStatus: 'PENDING', // MOCK: Devrait être vérifié dans RentPayment/RentReceipt
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/dashboard error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
