import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

/**
 * DIA-04: CRON de monitoring SLA Diaspora (Rule DIA-04)
 * Vérifie si les mandataires locaux respectent les délais de réponse.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[CRON Diaspora SLA] Exécution...");

    // 1. Récupérer les signalements non résolus pour les propriétés Diaspora
    const openSignals = await (prisma as any).signalementLocataire.findMany({
      where: {
        statut: { in: ["ENVOYE", "VU"] },
        resoluAt: null,
        bail: {
          property: {
            owner: { diasporaAbonnement: true }
          }
        }
      },
      include: {
        bail: {
          include: {
            property: {
              include: { 
                owner: { select: { id: true, fullName: true, diasporaDevise: true } },
                manager: { select: { id: true, fullName: true, phone: true } }
              }
            }
          }
        }
      }
    });

    let slaAlerts = 0;

    for (const sig of openSignals) {
      const hoursSinceCreation = (Date.now() - new Date(sig.createdAt).getTime()) / (1000 * 60 * 60);
      
      // Rule DIA-04 Thresholds
      const threshold = (sig.urgence === "URGENT" || sig.urgence === "TRES_URGENT") ? 24 : 48;

      if (hoursSinceCreation > threshold) {
        slaAlerts++;
        const landlord = sig.bail.property.owner;
        const manager = sig.bail.property.manager;

        // 2. Alerter le Propriétaire Diaspora (Email/SMS)
        if (landlord) {
            await NotificationService.envoyerNotification(landlord.id, "DIASPORA_SLA_ALARM", {
                payload: {
                    smsText: `QAPRIL ALERTE : Votre mandataire (${manager?.fullName || "Non assigné"}) n'a pas réagi au signalement #${sig.id.slice(0,6)} dans le délai SLA de ${threshold}h.`,
                    parameters: [manager?.fullName || "Mandataire", sig.id.slice(0,6), String(Math.floor(hoursSinceCreation))]
                }
            }).catch(console.error);
        }

        // 3. Log de l'incident SLA dans l'Audit
        await prisma.auditLog.create({
            data: {
                userId: landlord.id,
                action: "SLA_BREACH",
                module: "DIASPORA",
                entityId: sig.id,
                newValues: { 
                    hoursSinceCreation, 
                    threshold, 
                    managerId: manager?.id,
                    managerName: manager?.fullName 
                }
            }
        });
      }
    }

    return NextResponse.json({ 
        success: true, 
        processed: openSignals.length, 
        alertsSent: slaAlerts 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[CRON Diaspora SLA] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
