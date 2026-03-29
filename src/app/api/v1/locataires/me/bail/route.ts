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
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'PENDING_CONFIRMATION', 'LOYER_IMPAYE'] }
      },
      include: {
        property: true,
        landlord: true,
        agent: true
      },
      orderBy: { startDate: 'desc' }
    });

    if (!lease) {
      return NextResponse.json({ error: 'No active lease found' }, { status: 404 });
    }

    // Apply serialization which handles MM-04b masking
    const serialized = serializeLease(lease);

    const mapping = {
      ref: serialized.leaseReference,
      type: serialized.typeBail,
      logement: serialized.property?.name || serialized.property?.address || 'Mon logement',
      adresse: serialized.property?.address || 'N/A',
      code: serialized.property?.propertyCode || 'N/A',
      loyer: serialized.rentAmount,
      charges: serialized.chargesAmount || 0,
      total: serialized.rentAmount + (serialized.chargesAmount || 0),
      debut: serialized.startDate,
      fin: serialized.endDate || null,
      echeanceJour: serialized.paymentDay || 5,
      pages: 4,
      sha: serialized.leaseHash || null,
      statut: serialized.status === 'ACTIVE' ? 'À jour' : 'Attention',
      retard: serialized.status === 'LOYER_IMPAYE' ? 1 : 0,
      typeGestion: serialized.typeGestion || 'directe',
      agence: serialized.agent?.fullName || null,
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
