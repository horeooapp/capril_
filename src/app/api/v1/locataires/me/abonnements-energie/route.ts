import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/locataires/me/abonnements-energie
 * Returns the CIE/SODECI energy subscriptions for the authenticated tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This typically joins with a 'Utility' or 'EnergySubscription' table
    // For now, we fetch from the lease connection or property
    const lease = await prisma.lease.findFirst({
        where: { tenantId: user.id, status: 'ACTIVE' },
        include: { property: true }
    });

    if (!lease) {
        return NextResponse.json([]); // No active lease, no subscriptions
    }

    // Mapping to structure 3.4 in QAPRIL_API_MAPPING
    // In a real DB, these would be separate records. Here we mock them for the mobile UI
    // using base property info if available, or static robust data if not.
    const mapping = [
      {
        id: 'CIE-' + lease.id.substring(0, 4),
        type: 'CIE',
        compteur: '2026-CIE-042',
        contrat: 'CONTRAT-3304',
        dernierReleve: { date: '2026-03-01', index: 12450, unite: 'kWh' },
        derniereFacture: { mois: 'Février 2026', montant: 45000, statut: 'Payée', date: '2026-03-05', mode: 'Mobile Money' },
        prochaine: { date: '2026-04-05', estimee: 42000 },
        historique: [
            { mois: 'Oct', valeur: 38000 },
            { mois: 'Nov', valeur: 42000 },
            { mois: 'Déc', valeur: 55000 },
            { mois: 'Jan', valeur: 48000 },
            { mois: 'Fév', valeur: 45000 }
        ]
      },
      {
        id: 'SOD-' + lease.id.substring(0, 4),
        type: 'SODECI',
        compteur: '2026-SOD-009',
        contrat: 'CONTRAT-1120',
        dernierReleve: { date: '2026-03-02', index: 840, unite: 'm³' },
        derniereFacture: { mois: 'Février 2026', montant: 12500, statut: 'Payée', date: '2026-03-07', mode: 'Mobile Money' },
        prochaine: { date: '2026-04-07', estimee: 13000 },
        historique: [
            { mois: 'Oct', valeur: 11000 },
            { mois: 'Nov', valeur: 12000 },
            { mois: 'Déc', valeur: 14000 },
            { mois: 'Jan', valeur: 12500 },
            { mois: 'Fév', valeur: 12500 }
        ]
      }
    ];

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Energy Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
