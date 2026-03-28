import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/locataires/me
 * Returns the profile of the authenticated tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch again with more relations if needed
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        reliabilityScores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mapping = {
      id: fullUser.id,
      nom: fullUser.fullName || 'Locataire QAPRIL',
      telephone: fullUser.phone,
      email: fullUser.email,
      depuis: fullUser.createdAt.toISOString(),
      kyc: fullUser.kycStatus === 'VALIDATED' ? 'Validé' : 'En attente',
      score: fullUser.reliabilityScores?.[0]?.score || 750,
      scoreBase: 750,
      scoreKyc: 800,
      kycComplet: fullUser.kycLevel >= 4,
      kycEtapes: [
        { label: 'Identité', pts: 50, ok: fullUser.kycLevel >= 1, icon: 'id-card' },
        { label: 'Revenus', pts: 100, ok: fullUser.kycLevel >= 2, icon: 'wallet' },
        { label: 'Bailleur', pts: 50, ok: fullUser.kycLevel >= 3, icon: 'home' },
        { label: 'Vérification', pts: 'ICL 800', ok: fullUser.kycLevel >= 4, icon: 'verified' }
      ]
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
