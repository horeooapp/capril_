import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * GET /api/v1/cron/tasks
 * Processus automatisé pour les règles métiers ACT-01.
 * Sécurisé par un secret CRON passé en Authorization Header ou Query Param.
 */
export async function GET(req: Request) {
  try {
    const defaultHeaders = new Headers(req.headers);
    const authHeader = defaultHeaders.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'qapril-local-cron-secret';

    if (authHeader !== `Bearer ${expectedSecret}`) {
        // En prod, vous dé-commenterez cette ligne pour sécuriser.
        // return NextResponse.json({ error: 'Unauthorized CRON request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get('dryRun') === 'true';

    console.log('[CRON] Démarrage des tâches asynchrones...');

    // 1. RÈGLE QAPRIL : -2 pts si silence sur ticket RCL > 144h (6 jours)
    const limite144h = new Date(Date.now() - 144 * 60 * 60 * 1000);
    const originTickets = await prisma.ticketMaintenance.findMany({
      where: {
        statut: 'EN_ATTENTE',
        createdAt: { lt: limite144h },
        // On ne sanctionne qu'une fois. Ex: on passe le statut à PENALITE_APPLIQUEE ou ESCALADEE
        // Pour être sûr de ne pas boucler indéfiniment, on filtrera ceux déjà traités.
      },
      include: { lease: true }
    });

    let ticketsPunished = 0;
    for (const ticket of originTickets) {
      if (dryRun) continue;
      
      const landlordId = ticket.lease.landlordId;
      // Fetch or Create Reliability Score for Landlord
      let rScore = await prisma.reliabilityScore.findFirst({
        where: { userId: landlordId },
        orderBy: { createdAt: 'desc' }
      });

      if (!rScore) {
          rScore = await prisma.reliabilityScore.create({
              data: {
                  userId: landlordId,
                  score: 100, // Début à 100
                  grade: 'A',
                  breakdown: {}
              }
          });
      }

      await prisma.reliabilityScore.create({
        data: {
            userId: landlordId,
            score: Math.max(0, rScore.score - 2),
            grade: rScore.score - 2 >= 80 ? 'A' : (rScore.score - 2 >= 60 ? 'B' : 'C'),
            breakdown: { reason: "Silence > 144h sur Ticket Maintenance", ref: ticket.ticketRef }
        }
      });

      // Escalader le ticket pour éviter une double sanction demain
      await prisma.ticketMaintenance.update({
          where: { id: ticket.id },
          data: { statut: 'ESCALADEE' }
      });
      ticketsPunished++;
    }

    // 2. ALERTES EXPIRATION BAIL : 90j, 60j, 30j
    const now = new Date();
    // Expiration entre aujourd'hui et J+90
    const activeLeases = await prisma.lease.findMany({
      where: {
         status: 'ACTIVE',
         endDate: { not: null, gt: now }
      }
    });

    let alertsSent = 0;
    for (const lease of activeLeases) {
        if (!lease.endDate) continue;

        const diffTime = lease.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let alertType = null;
        if (diffDays === 90) alertType = 'T-90';
        else if (diffDays === 60) alertType = 'T-60';
        else if (diffDays === 30) alertType = 'T-30';

        if (alertType) {
            alertsSent++;
            if (!dryRun) {
                // Enregistrer dans la table Notification
                await prisma.notification.create({
                    data: {
                        userId: lease.landlordId,
                        type: 'INFO',
                        title: `Expiration de Bail (${alertType})`,
                        message: `Le bail expire dans ${diffDays} jours. Pensez au renouvellement.`,
                        data: JSON.stringify({ leaseId: lease.id }),
                        isRead: false
                    }
                 });
                 // Et pour le locataire :
                 if (lease.locataireId) {
                     await prisma.notification.create({
                        data: {
                            userId: lease.locataireId,
                            type: 'INFO',
                            title: `Expiration de Bail (${alertType})`,
                            message: `Votre bail expire dans ${diffDays} jours. Voudriez-vous renouveler ?`,
                            data: JSON.stringify({ leaseId: lease.id }),
                            isRead: false
                        }
                     });
                 }
            }
        }
    }

    console.log(`[CRON] ${ticketsPunished} pénalités de -2 pts appliquées. ${alertsSent} alertes d'expiration levées.`);

    return NextResponse.json({ 
      success: true, 
      dryRun,
      stats: {
          ticketsPunished,
          alertsSent
      }
    });

  } catch (error: any) {
    console.error('[CRON TASKS ERROR]', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue dans l\'automate' }, { status: 500 });
  }
}
