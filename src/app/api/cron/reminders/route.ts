import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

/**
 * Route exécutée par un Cron (ex: Vercel Cron) tous les jours à 08h00.
 * ADD-09: Envoie un rappel automatique 3 jours avant l'échéance du loyer.
 */
export async function GET(request: Request) {
  try {
    // 1. Authentification CRON
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !vercelCron) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Récupérer les Baux Actifs
    const activeLeases = await prisma.lease.findMany({
      where: { 
        status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] },
        tenantId: { not: null }
      },
      include: { tenant: true, property: true }
    });

    let sentCount = 0;
    const today = new Date();
    // Neutralize time to avoid timezone issues on diff
    today.setHours(0, 0, 0, 0);

    for (const lease of activeLeases) {
      if (!lease.tenantId || !lease.paymentDay) continue;

      // Calculer la prochaine date de paiement
      const nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), lease.paymentDay);
      nextPaymentDate.setHours(0, 0, 0, 0);
      
      // Si la date est déjà passée ce mois-ci, l'échéance est le mois prochain
      if (nextPaymentDate < today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      const diffTime = nextPaymentDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Si l'échéance est exactement dans 3 jours
      if (diffDays === 3) {
        // Vérifier s'il a déjà payé pour cette période (YYYY-MM de la date de paiement)
        const periodMonth = `${nextPaymentDate.getFullYear()}-${String(nextPaymentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const existingReceipt = await prisma.receipt.findFirst({
          where: {
            leaseId: lease.id,
            periodMonth: periodMonth,
            status: "PAID"
          }
        });

        // S'il n'a pas encore payé
        if (!existingReceipt) {
          sentCount++;
          
          await NotificationService.envoyerNotification(
            lease.tenantId,
            "RAPPEL_ECHEANCE",
            {
               payload: {
                   smsText: `QAPRIL: Bonjour ${lease.tenant?.fullName || "Locataire"}. Votre loyer pour le bien à ${lease.property.commune} expire dans 3 jours. Montant: ${lease.rentAmount + lease.chargesAmount} FCFA.`,
                   html: `<p>Rappel de Loyer QAPRIL.</p><p>Votre loyer pour la période <strong>${periodMonth}</strong> arrive à échéance dans 3 jours. Montant à payer : <strong>${lease.rentAmount + lease.chargesAmount} FCFA</strong>.</p>`,
                   parameters: []
               }
            }
          ).catch(err => console.error("[CRON_REMINDER] Notif Failed:", err));
        }
      }
    }

    return NextResponse.json({ success: true, count: sentCount }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron Reminders] Erreur globale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
