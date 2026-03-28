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
      where: { id: user.id }
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-specific mapping 6.1
    const mapping = {
      id: fullUser.id,
      nom: fullUser.fullName,
      email: fullUser.email,
      telephone: fullUser.phone,
      code: fullUser.landlordCode || `AG-${fullUser.id.substring(0, 5)}`,
      commune: 'Abidjan', // Default for now
      agreement: 'CIMA/QAP-2026', // Static/Mock if not in DB
      stats: {
         biens: 0,
         caTheorique: 0,
         caEncaisse: 0,
         candidats: 0
      }
    };

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API AGENCE] Get Me Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
