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

      // 1. Current Month Due Date
      const currentMonthDueDate = new Date(today.getFullYear(), today.getMonth(), lease.paymentDay);
      currentMonthDueDate.setHours(0, 0, 0, 0);
      
      const periodMonth = `${currentMonthDueDate.getFullYear()}-${String(currentMonthDueDate.getMonth() + 1).padStart(2, '0')}`;
      
      const diffTime = today.getTime() - currentMonthDueDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // 2. Check if already paid
      const isPaid = await prisma.receipt.findFirst({
        where: { leaseId: lease.id, periodMonth: periodMonth, status: "PAID" }
      });

      if (isPaid) continue;

      // 3. Dispatch based on diffDays
      let notifType: string | null = null;
      let msgSms = "";
      let msgHtml = "";

      if (diffDays === -3) {
        notifType = "RAPPEL_ECHEANCE";
        msgSms = `QAPRIL: Votre loyer (${periodMonth}) arrive à échéance dans 3 jours. Montant: ${lease.rentAmount + lease.chargesAmount} FCFA.`;
        msgHtml = `<p>Votre loyer pour <strong>${periodMonth}</strong> arrive à échéance dans 3 jours.</p>`;
      } 
      else if (diffDays === 1) {
        notifType = "RETARD_J1";
        msgSms = `QAPRIL: ALERTE RETARD. Votre loyer (${periodMonth}) est impayé (échéance hier). Merci de régulariser immédiatement.`;
        msgHtml = `<h3>ALERTE RETARD</h3><p>Votre loyer pour <strong>${periodMonth}</strong> est en retard de 1 jour.</p>`;
      }
      else if (diffDays === 5) {
        notifType = "RETARD_J5";
        msgSms = `QAPRIL: MISE EN DEMEURE. Votre loyer (${periodMonth}) est en retard de 5 jours. Des frais de recouvrement peuvent s'appliquer.`;
        msgHtml = `<h3>MISE EN DEMEURE</h3><p>Retard de 5 jours constaté pour la période <strong>${periodMonth}</strong>.</p>`;
      }
      else if (diffDays === 10) {
        notifType = "RETARD_J10";
        msgSms = `QAPRIL: DERNIER AVERTISSEMENT. Défaut de paiement constaté (10 jours). Dossier transmis pour recouvrement forcé.`;
        msgHtml = `<h3>DERNIER AVERTISSEMENT</h3><p>Retard critique de 10 jours pour <strong>${periodMonth}</strong>.</p>`;
      }

      if (notifType) {
        sentCount++;
        await NotificationService.envoyerNotification(
          lease.tenantId,
          notifType as any,
          {
            payload: {
              smsText: msgSms,
              html: msgHtml,
              parameters: [lease.tenant?.fullName || "Locataire"]
            }
          }
        ).catch(err => console.error(`[CRON_NOTIF_FAILED] ${notifType}:`, err));
      }
    }

    return NextResponse.json({ success: true, count: sentCount }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron Reminders] Erreur globale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
