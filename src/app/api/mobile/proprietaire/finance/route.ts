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
        
        const receipts = await prisma.receipt.findMany({
            where: {
                lease: {
                    property: {
                        OR: [{ ownerUserId: user.userId }, { landlordId: user.userId }]
                    }
                },
                status: 'PAID'
            },
            include: {
                lease: {
                    include: {
                        property: true
                    }
                }
            },
            orderBy: {
                paidAt: 'desc'
            },
            take: 20
        });

        const transactions = receipts.map((receipt, index) => ({
            id: receipt.id,
            date: receipt.paidAt?.toISOString() || receipt.createdAt?.toISOString(),
            amount: receipt.totalAmount || receipt.rentAmount,
            property: receipt.lease.property?.name || 'Bien',
            type: 'INCOME',
            status: 'COMPLETED'
        }));

        const totalReceived = transactions.reduce((acc, txn) => acc + txn.amount, 0);

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
