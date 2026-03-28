import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { serializeProperty } from '@/lib/serialize';

/**
 * GET /api/v1/proprietaires/patrimoine
 * Returns the list of properties and units for the authenticated landlord
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: { ownerUserId: user.id },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: { tenant: true }
        }
      }
    });

    // Mapping 4.2: List of entities with their occupancy
    const mapping = properties.map((p) => {
        const activeLease = p.leases[0];
        
        return {
            id: p.id,
            code: p.propertyCode || `PRO-${p.id.substring(0,4)}`,
            nom: p.name || p.address,
            adresse: p.address,
            type: p.propertyType === 'immeuble' ? 'immeuble' : 'standalone',
            unites: 1, // 1 Property = 1 Unit
            occupes: activeLease ? 1 : 0,
            vacants: activeLease ? 0 : 1,
            impayes: 0, // Placeholder
            locataire: activeLease?.tenant?.fullName || null
        };
    });

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API PROPRIO] Get Patrimoine Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
