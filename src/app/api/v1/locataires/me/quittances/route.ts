import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { serializeObject } from '@/lib/serialize';

/**
 * GET /api/v1/locataires/me/quittances
 * Returns the rent receipts history for the authenticated tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find active lease first
    const lease = await prisma.lease.findFirst({
      where: { 
        tenantId: user.id,
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE', 'TERMINATED'] }
      },
      select: { id: true }
    });

    if (!lease) {
      return NextResponse.json([]);
    }

    const receipts = await prisma.receipt.findMany({
      where: { leaseId: lease.id },
      orderBy: { createdAt: 'desc' }
    });

    // Map to UI structure
    const mapping = receipts.map(r => ({
      id: r.id,
      ref: r.receiptRef,
      periode: r.periodMonth, // format YYYY-MM
      montant: Number(r.totalAmount),
      date: r.paidAt ? r.paidAt.toISOString() : r.createdAt.toISOString(),
      statut: r.status === 'paid' ? 'Payée' : 'En attente',
      certifie: true,
      url: r.pdfUrl || null
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Receipts Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
