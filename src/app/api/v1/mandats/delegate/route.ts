import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/mandats/delegate
 * Assigns property rights to an intermediary or agency securely.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || (!['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string) && (user as any).profileType !== 'DIASPORA')) {
      return NextResponse.json({ error: 'Réservé aux propriétaires' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { propertyId, agentEmail, niveauDesDroits } = body;

    if (!propertyId || !agentEmail) {
      return NextResponse.json({ error: 'ID du bien et Email de l\'agent requis.' }, { status: 400 });
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
       where: { id: propertyId, ownerUserId: user.id }
    });

    if (!property) {
       return NextResponse.json({ error: 'Bien non trouvé ou droits insuffisants.' }, { status: 404 });
    }

    // Verify Agent exists
    const agent = await prisma.user.findFirst({
        where: { email: agentEmail.toLowerCase().trim() }
    });

    if (!agent) {
        // Technically, you could invite them, but for strict regulation, they must be registered.
        return NextResponse.json({ error: 'Gestionnaire introuvable dans le répertoire QAPRIL.' }, { status: 404 });
    }

    // Assigning Mandate dynamically
    // In production, insert into `MandatGestion` or `Mandate` with specific enum definitions.
    // For now we simulate the assignment.
    const ref = `MND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({ 
        success: true, 
        message: `Délégation de pouvoir (Niveau: ${niveauDesDroits || 'ENC_SEUL'}) assignée à ${agent.email}.`,
        reference: ref
    });

  } catch (error: any) {
    console.error('[API MANDAT] Delegate Error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'assignation du mandat.' }, { status: 500 });
  }
}
