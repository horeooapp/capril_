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
    if (!user || !['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized or role mismatch' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        walletConfig: true,
        propertiesOwned: {
          include: {
            leases: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const nbBiens = fullUser.propertiesOwned.length;
    const loyerTotal = fullUser.propertiesOwned.reduce((sum, p) => {
      const activeLease = p.leases[0];
      return sum + (activeLease ? activeLease.rentAmount : 0);
    }, 0);

    // Role-specific mapping 4.1
    const mapping = {
      id: fullUser.id,
      nom: (fullUser.firstName ? fullUser.firstName + " " : "") + (fullUser.lastName || ""),
      email: fullUser.email,
      telephone: fullUser.phone,
      code: fullUser?.walletConfig?.landlordCode || 'BAI-XXX',
      abonnement: fullUser.activePlanTier || 'ESSENTIEL',
      wallet: {
        solde: ((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0,
        decouvert: -1500, // Fixed rule ADD-07 v3
        devise: 'FCFA',
        statut: (((fullUser?.walletConfig?.walletBalance || 0) || 0) || 0) < 0 ? 'Débiteur' : 'Actif'
      },
      stats: {
         entites: nbBiens,
         loyerTheorique: loyerTotal
      }
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API PROPRIO] Get Me Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
