import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/locataires/me/abonnements-energie
 * Returns CIE/SODECI identifiers and shared billing history
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
        identifiantCie: true,
        identifiantSodeci: true,
        modeUtilities: true
      }
    });

    if (!lease) {
      return NextResponse.json({ cie: null, sodeci: null, history: [] });
    }

    const factures = await prisma.factureUtility.findMany({
      where: { leaseId: lease.id },
      orderBy: { moisFacture: 'desc' },
      take: 12
    });

    const mapping = {
      cie: lease.identifiantCie || 'Non renseigné',
      sodeci: lease.identifiantSodeci || 'Non renseigné',
      mode: lease.modeUtilities,
      history: factures.map(f => ({
        id: f.id,
        type: f.typeUtility, // CIE | SODECI
        mois: f.moisFacture.toISOString(),
        montant: f.montantTotal,
        statut: f.statut === 'PAYÉE' ? 'Réglé' : 'À payer',
        limite: f.dateLimitePaiement ? f.dateLimitePaiement.toISOString() : null
      }))
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Utilities Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
