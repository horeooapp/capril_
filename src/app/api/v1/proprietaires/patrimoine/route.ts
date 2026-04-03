import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/proprietaires/patrimoine
 * Returns the list of properties owned by the authenticated landlord
 * with their active leases and tenants.
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: { ownerUserId: user.id },
      include: {
        leases: {
           include: {
              tenant: {
                 select: {
                    firstName: true, lastName: true,
                    phone: true,
                    email: true
                 }
              }
           }
        }
      }
    });

    // Mapping to match UI expectations (OwnerPortalDashboard)
    const mapping = properties.map(p => ({
       id: p.id,
       code: p.propertyCode,
       nom: p.name,
       adresse: p.address,
       commune: p.commune,
       type: p.propertyType,
       status: p.status,
       leases: p.leases.map(l => ({
          id: l.id,
          reference: l.leaseReference,
          status: l.status,
          rentAmount: l.rentAmount,
          tenantName: (l.tenant?.firstName ? l.tenant.firstName + " " : "") + (l.tenant?.lastName || ""),
          startDate: l.startDate,
          endDate: l.endDate
       }))
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API PATRIMOINE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/v1/proprietaires/patrimoine
 * Creates a new property for the authenticated landlord.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    // Ensure the user has the right to create properties
    if (!user || !['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, commune, address } = body;

    // Basic validation
    if (!name) {
       return NextResponse.json({ error: 'Le nom de la propriété est requis' }, { status: 400 });
    }

    // Generate a unique code (e.g. PROP-XXXX)
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    const propertyCode = `PROP-${randomHex}`;

    const newProperty = await prisma.property.create({
      data: {
        ownerUserId: user.id,
        propertyCode,
        name,
        propertyType: type || 'RESIDENTIAL',
        commune: commune || '',
        address: address || '',
        status: 'active'
      }
    });

    return NextResponse.json({
       success: true,
       property: {
         id: newProperty.id,
         code: newProperty.propertyCode,
         nom: newProperty.name,
         type: newProperty.propertyType,
         commune: newProperty.commune
       }
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API PATRIMOINE POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
