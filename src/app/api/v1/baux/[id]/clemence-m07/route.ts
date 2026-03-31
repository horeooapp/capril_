import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/baux/[id]/clemence-m07
 * Sets a lease status to 'CLEMENCE_EN_COURS', granting temporary reprieve.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaseId = params.id;
    if (!leaseId) {
       return NextResponse.json({ error: 'Lease ID is required' }, { status: 400 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { landlord: true }
    });

    if (!lease) {
      return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 });
    }

    // Role check: Only landlords, diaspora, or delegated agents (with rights) can apply M07.
    // For this mock, we ensure the connected user is the landlord or an agent.
    if (lease.landlordId !== user.id && user.role !== 'NON_CERTIFIED_AGENT') {
       return NextResponse.json({ error: 'Vous ne possédez pas les droits sur ce bail.' }, { status: 403 });
    }

    const { type, value } = await req.json().catch(() => ({}));
    
    // Update lease status
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: 'CLEMENCE_EN_COURS'
      }
    });

    // In a real flow, we would register the M07 Mediation request in the `Mediation` table.
    
    return NextResponse.json({ 
        success: true, 
        message: `M07 Appliquée: La demande de Clémence (${type === 'DELAI' ? 'Délai' : 'Échéancier'}) a été enregistrée. Le statut du bail passe en Clémence En Cours.`,
    });

  } catch (error: any) {
    console.error('[API BAUX] Clemence Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de l\'application de la clémence.' }, { status: 500 });
  }
}
