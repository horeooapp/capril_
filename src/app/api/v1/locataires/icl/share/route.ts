import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';
import jwt from 'jsonwebtoken';

/**
 * POST /api/v1/locataires/icl/share
 * Generates a signed, 30-day token for sharing the tenant's ICL score securely.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Réservé aux locataires (ACT-02)' }, { status: 401 });
    }

    const tenant = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        reliabilityScores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Usually reliabilityScores contains historical scores. If empty, default 750 (ICL base)
    const latestScore = (tenant as any).reliabilityScores?.[0]?.score || 750;

    const secret = process.env.NEXTAUTH_SECRET || 'qapril-secure-key-2026';
    
    // Generate JWT payload
    const token = jwt.sign(
      { 
         type: 'ICL-CONSENT-01', 
         tenantId: user.id, 
         score: latestScore, 
         certifiedDate: Date.now() 
      },
      secret,
      { expiresIn: '30d' } // Expires in 30 days
    );

    const link = `https://qapril.ci/v/icl?t=${token}`;

    return NextResponse.json({ 
        success: true, 
        message: `Consentement ICL enregistré. Le lien de vérification public est disponible pour 30 jours.`,
        score: latestScore,
        link,
        ttl: '30d'
    });

  } catch (error: any) {
    console.error('[API ICL] Share Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du lien ICL.' }, { status: 500 });
  }
}
