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
            include: { property: true }
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
            date: r.paidAt?.toISOString().substring(0, 10) || '',
            amount: r.totalAmount,
            status: r.status === 'paid' || r.status === 'PAID' ? 'PAID' : 'PENDING',
            period: r.moisConcerne || r.periodMonth
        }));

        return NextResponse.json({
            receipts: receipts,
            currency: 'FCFA'
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/receipts error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
