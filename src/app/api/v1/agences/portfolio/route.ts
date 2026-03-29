import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/agences/portfolio
 * Returns the list of properties managed by the authenticated agency.
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
           include: {
              tenant: {
                 select: {
                    fullName: true,
                    phone: true,
                    email: true
                 }
              }
           }
        },
        owner: {
           select: {
              fullName: true,
              phone: true,
              email: true
           }
        }
      }
    });

    // Mapping to match UI expectations (AgencyPortalDashboard)
    const mapping = properties.map(p => ({
       id: p.id,
       code: p.propertyCode,
       nom: p.name,
       adresse: p.address,
       commune: p.commune,
       type: p.propertyType,
       status: p.status,
       ownerName: p.owner?.fullName,
       leases: p.leases.map(l => ({
          id: l.id,
          reference: l.leaseReference,
          status: l.status,
          rentAmount: l.rentAmount,
          tenantName: l.tenant?.fullName,
          startDate: l.startDate,
          endDate: l.endDate
       }))
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API PORTFOLIO] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
