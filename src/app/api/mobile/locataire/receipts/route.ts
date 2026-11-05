import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        // Récupérer le bail du locataire
        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId },
            include: { property: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!lease) {
            return NextResponse.json({ receipts: [] });
        }

        const dbReceipts = await prisma.receipt.findMany({
            where: { leaseId: lease.id },
            orderBy: { periodMonth: 'desc' }
        });

        const receipts = dbReceipts.map(r => ({
            id: r.id,
            receiptRef: r.receiptRef,
            date: r.paidAt?.toISOString().substring(0, 10) || r.createdAt.toISOString().substring(0, 10),
            amount: r.totalAmount || r.rentAmount || 0,
            status: r.status === 'paid' || r.status === 'PAID' ? 'PAID' : 'PENDING',
            period: r.moisConcerne || r.periodMonth,
            paymentMethod: r.paymentMethod || 'Wave',
            receiptHash: r.receiptHash || null
        }));

        return NextResponse.json({
            receipts: receipts,
            currency: 'XOF'
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/receipts error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
