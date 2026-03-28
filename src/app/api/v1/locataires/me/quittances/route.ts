import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { serializeReceipt } from '@/lib/serialize';

/**
 * GET /api/v1/locataires/me/quittances
 * Returns the list of certified receipts for the authenticated tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const receipts = await prisma.receipt.findMany({
      where: { 
        lease: { tenantId: user.id }
      },
      orderBy: { periodMonth: 'desc' },
      take: 24 // Reasonable history for mobile
    });

    const mapping = receipts.map((rec: any) => ({
      ref: rec.reference || rec.id,
      mois: rec.periodMonth, // ex: "Mars 2026"
      montant: Number(rec.amount || rec.totalAmount || 0),
      statut: rec.status === 'paid' ? 'Certifiée' : 'Impayée',
      date: rec.paidAt instanceof Date ? rec.paidAt.toISOString() : rec.paidAt,
      sha: rec.receiptHash || null,
      laposte: (rec as any).laPosteRef || null
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Quittances Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
