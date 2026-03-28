import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/agences/portfolio
 * Returns the list of properties managed by the authenticated agency
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'AGENCY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: { managedByUserId: user.id },
      include: {
        leases: {
           where: { status: 'ACTIVE' },
           include: { tenant: true }
        }
      }
    });

    // Mapping 6.2
    const mapping = properties.map(p => ({
        id: p.id,
        adresse: p.address,
        type: p.propertyType === 'immeuble' ? 'IMMEUBLE' : 'BIEN INDIVIDUEL',
        loyer: p.declaredRentFcfa || 0,
        statut: p.leases.length > 0 ? 'occupé' : 'vacant',
        paiement: 'À jour', // Placeholder
        units: 1 // In this schema, 1 Property = 1 Unit
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API AGENCE] Get Portfolio Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
