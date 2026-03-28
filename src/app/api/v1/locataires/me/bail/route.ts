import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import { serializeLease } from '@/lib/serialize';

/**
 * GET /api/v1/locataires/me/bail
 * Returns the active lease for the authenticated tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized or role mismatch' }, { status: 401 });
    }

    const lease = await prisma.lease.findFirst({
      where: { 
        tenantId: user.id,
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'PENDING_CONFIRMATION'] }
      },
      include: {
        property: true,
        landlord: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            landlordCode: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    if (!lease) {
      return NextResponse.json({ error: 'No active lease found' }, { status: 404 });
    }

    // Apply serialization which handles MM-04b masking
    const serialized = serializeLease(lease);

    // Map to the specific structure expected by QAPRIL_API_MAPPING 3.2
    const mapping = {
      ref: serialized.leaseReference,
      type: serialized.typeBail,
      logement: serialized.property?.title || serialized.property?.address || 'Mon logement',
      adresse: serialized.property?.address || 'N/A',
      code: serialized.property?.propertyCode || 'N/A',
      loyer: serialized.rentAmount,
      debut: serialized.startDate,
      fin: serialized.endDate || null,
      echeanceJour: 1, // Default to 1st of month
      pages: 4,
      sha: serialized.leaseHash || null,
      statut: serialized.status === 'ACTIVE' ? 'À jour' : 'En attente',
      retard: 0,
      typeGestion: serialized.typeGestion || 'directe',
      agence: serialized.landlord?.fullName || null,
      bailleurNom: serialized.landlord?.fullName,
      bailleurCode: serialized.landlord?.landlordCode,
      bailleurMasque: !!serialized.bailleurMasque
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Bail Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
