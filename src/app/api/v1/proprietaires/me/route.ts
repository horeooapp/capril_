import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/proprietaires/me
 * Returns the profile and wallet status of the authenticated landlord
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Unauthorized or role mismatch' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-specific mapping 4.1
    const mapping = {
      id: fullUser.id,
      nom: fullUser.fullName,
      email: fullUser.email,
      telephone: fullUser.phone,
      code: (fullUser as any).landlordCode || 'BAI-XXX',
      abonnement: (fullUser as any).subscriptionLevel || 'Gérant',
      wallet: {
        solde: (fullUser as any).walletBalance || 0,
        decouvert: -1500, // Fixed rule ADD-07 v3
        devise: 'FCFA',
        statut: ((fullUser as any).walletBalance || 0) < 0 ? 'Débiteur' : 'Actif'
      },
      stats: {
         entites: 0, // Should be calculated
         loyerTheorique: 0
      }
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API PROPRIO] Get Me Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
