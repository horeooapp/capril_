import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/locataires/me/caution
 * Returns the security deposit status (CDC or direct) for the tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lease = await prisma.lease.findFirst({
      where: { 
        tenantId: user.id,
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] }
      },
      select: {
          id: true,
          depositAmount: true,
          caution: true,
          cdcDeposits: true
      }
    });

    if (!lease) {
      return NextResponse.json({ amount: 0, status: 'Aucun bail actif', destination: 'N/A' });
    }

    // Checking CautionBail (Internal Direct or Agence)
    const caution = await prisma.cautionBail.findUnique({
      where: { bailId: lease.id }
    });

    // Checking CDCDeposit (Official CDC CI)
    const cdc = await prisma.cDCDeposit.findUnique({
      where: { leaseId: lease.id }
    });

    const mapping = {
      amount: Number(caution?.montantFcfa || lease.depositAmount || 0),
      status: cdc ? (cdc.status === 'CONSIGNED' ? 'Consignée (CDC)' : 'En cours CDC') : (caution?.restituee ? 'Restituée' : 'Détenue par bailleur'),
      destination: cdc ? 'Caisse des Dépôts' : (caution?.destination || 'Propriétaire'),
      certificat: caution?.certificatRef || null,
      restituee: caution?.restituee || !!cdc?.returnedAt
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Caution Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
