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

    // 1. Try to find a formal Lease
    const lease = await prisma.lease.findFirst({
      where: { 
        tenantId: user.id,
        status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'PENDING_CONFIRMATION', 'PENDING_SIGNATURE', 'PENDING_DEPOSIT', 'LOYER_IMPAYE', 'DRAFT'] }
      },
      include: {
        property: true,
        landlord: true,
        agent: true
      },
      orderBy: { startDate: 'desc' }
    });

    if (lease) {
      // Apply serialization which handles MM-04b masking
      const serialized = serializeLease(lease);

      return NextResponse.json({
        id: serialized.id,
        ref: serialized.leaseReference,
        type: serialized.typeBail || 'ÉCRIT',
        logement: serialized.property?.name || serialized.property?.address || 'Mon logement',
        adresse: serialized.property?.address || 'N/A',
        code: serialized.property?.propertyCode || 'N/A',
        loyer: serialized.rentAmount,
        charges: serialized.chargesAmount || 0,
        total: (serialized.rentAmount || 0) + (serialized.chargesAmount || 0),
        debut: serialized.startDate,
        fin: serialized.endDate || null,
        echeanceJour: serialized.paymentDay || 5,
        statut: serialized.status === 'ACTIVE' ? 'À jour' : 'En cours',
        retard: serialized.status === 'LOYER_IMPAYE' ? 1 : 0,
        typeGestion: serialized.typeGestion || 'directe',
        agence: serialized.agent?.fullName || null,
        bailleurNom: serialized.landlord?.fullName,
        bailleurCode: serialized.landlord?.landlordCode,
        bailleurMasque: !!serialized.bailleurMasque
      });
    }

    // 2. Fallback: Try to find a BailDeclaratif (Declarative)
    // Match by locataireId OR telephoneLocataire
    const bdq = await prisma.bailDeclaratif.findFirst({
      where: {
        OR: [
          { locataireId: user.id },
          { telephoneLocataire: user.phone || 'N/A' }
        ]
      },
      include: {
        property: true,
        bailleur: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (bdq) {
      return NextResponse.json({
        id: bdq.id,
        ref: `BDQ-${bdq.id.substring(0, 8).toUpperCase()}`,
        type: 'VERBAL',
        logement: bdq.property?.name || bdq.descriptionLogement || 'Logement déclaré',
        adresse: bdq.property?.address || bdq.adresseLibre || 'En attente',
        code: bdq.property?.propertyCode || 'N/A',
        loyer: bdq.loyerDeclareMensuel,
        charges: 0,
        total: bdq.loyerDeclareMensuel,
        debut: bdq.dateEntreeEstimee,
        fin: null,
        echeanceJour: 5,
        statut: 'Déclaratif',
        retard: 0,
        isDeclarative: true,
        bdqStatus: bdq.statut,
        bailleurNom: bdq.bailleur?.fullName || bdq.bailleur?.name || 'Bailleur Inconnu'
      });
    }

    // 3. Absolute Fallback: Return empty state (no crash)
    return NextResponse.json({ noLease: true });
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Bail Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
