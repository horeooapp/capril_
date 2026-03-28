import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/agences/candidates
 * Returns the list of candidatures for properties managed by the authenticated agency
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'AGENCY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidatures = await prisma.candidature.findMany({
      where: {
        logement: {
          managedByUserId: user.id
        }
      },
      include: {
        logement: true,
        candidat: {
           include: {
              reliabilityScores: {
                 orderBy: { createdAt: 'desc' },
                 take: 1
              }
           }
        }
      }
    });

    // Mapping 6.3
    const mapping = candidatures.map(c => ({
        id: c.id,
        nom: c.nom + (c.prenom ? ' ' + c.prenom : ''),
        telephone: c.telephone,
        emploi: c.employeur || 'Non précisé',
        loyerMax: c.revenuMensuel ? c.revenuMensuel / 3 : 0, // Rule of thumb
        score: c.candidat?.reliabilityScores[0]?.score || null,
        statut: c.statut,
        bien: c.logement.address,
        autorisation: c.scoreQapril ? 'accordée' : 'en_attente' // Logic based on whether score is filled
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API AGENCE] Get Candidates Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
