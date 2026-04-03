import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/agences/me
 * Returns the profile and accreditation of the authenticated agency
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'AGENCY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        walletConfig: true,
        propertiesManaged: {
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

    const nbBiens = fullUser.propertiesManaged.length;
    const caTheorique = fullUser.propertiesManaged.reduce((sum, p) => {
      const activeLease = p.leases[0];
      return sum + (activeLease ? (activeLease.rentAmount + (activeLease.chargesAmount || 0)) : 0);
    }, 0);

    // Role-specific mapping 6.1
    const mapping = {
      id: fullUser.id,
      nom: (fullUser.firstName ? fullUser.firstName + " " : "") + (fullUser.lastName || ""),
      email: fullUser.email,
      telephone: fullUser.phone,
      code: fullUser?.walletConfig?.landlordCode || `AG-${fullUser.id.substring(0, 5)}`,
      commune: fullUser.propertiesManaged[0]?.commune || 'Abidjan',
      agreement: 'CIMA/QAP-2026',
      stats: {
         biens: nbBiens,
         caTheorique: caTheorique,
         caEncaisse: 0, // Should be calculated from monthly synthesis if needed
         candidats: 0   // To be implemented
      }
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API AGENCE] Get Me Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
