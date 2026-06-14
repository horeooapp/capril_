import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        // Pour la démo, on simule des transactions financières récentes basées sur le fait que le propriétaire a des biens
        // Idéalement on fetch de la table RentPayment
        
        const properties = await prisma.property.findMany({
            where: { landlordId: user.userId },
            include: { leases: { where: { status: 'ACTIVE' } } }
        });

        const transactions = [];
        let totalReceived = 0;

        properties.forEach((prop, index) => {
            if (prop.leases && prop.leases.length > 0) {
                const rent = prop.leases[0].rentAmount || 0;
                totalReceived += rent;
                transactions.push({
                    id: `txn-${index}`,
                    date: new Date().toISOString(),
                    amount: rent,
                    property: prop.name || 'Bien',
                    type: 'INCOME',
                    status: 'COMPLETED'
                });
            }
        });

        return NextResponse.json({
            transactions: transactions,
            balance: totalReceived,
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/finance error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
