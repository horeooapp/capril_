import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

/**
 * Route exécutée par un Cron (ex: Vercel Cron) tous les jours à 08h00.
 * Elle détecte les loyers impayés et déclenche IMPAYE_DETECTE (ADD-09).
 */
export async function GET(request: Request) {
  try {
    // 1. Sécuriser l'endpoint avec un CRON_SECRET pour éviter des appels externes non-autorisés
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Dans certains cas (Vercel), l'en-tête est x-vercel-cron
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Identifier le mois actuel (YYYY-MM) et le jour actuel
    const today = new Date();
    const currentDay = today.getDate();
    const periodMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Si on est avant le 6 du mois, la date limite de paiement (généralement le 5) n'est pas passée.
    // L'idéal est de se baser sur la date d'échéance spécifique de chaque contrat (lease.paymentDueDate).
    // Pour cet exemple MVP, on considère tout loyer non-payé après le 5 comme "Impayé".
    if (currentDay <= 5) {
      return NextResponse.json({ message: "Période de grâce, aucune action requise." }, { status: 200 });
    }

    console.log(`[Cron Impayés] Exécution pour la période ${periodMonth}`);

    // 3. Récupérer les Baux Actifs
    const activeLeases = await prisma.lease.findMany({
      where: { status: "ACTIVE" },
      include: { tenant: true, property: true }
    });

    let detectedCount = 0;

    for (const lease of activeLeases) {
      // Vérifier si un reçu (quittance) a déjà été émis pour le mois en question
      const existingReceipt = await prisma.receipt.findFirst({
        where: {
          leaseId: lease.id,
          periodMonth: periodMonth,
          status: "PAID"
        }
      });

      if (!existingReceipt && lease.tenantId) {
        // Aucune quittance ce mois-ci, donc impayé
        detectedCount++;
        
        // 4. Déclencher le Dispatcher de l'ADD-09
        await NotificationService.envoyerNotification(
            lease.tenantId,
            "IMPAYE_DETECTE",
            {
               payload: {
                   smsText: `QAPRIL: Votre loyer de la période ${periodMonth} est en retard. Merci de régulariser la situation dès que possible.`,
                   html: `<p>Alerte de retard de Paiement QAPRIL.</p><p>Nous vous informons que nous n'avons pas constaté de règlement de votre loyer pour la période <strong>${periodMonth}</strong> de la propriété <strong>${lease.property?.address}</strong>.</p>`,
                   parameters: [lease.tenant?.fullName || "Locataire", periodMonth, String(lease.rentAmount + lease.chargesAmount)]
               }
            }
        ).catch(err => console.error("[CRON_IMPAYE] Notif Failed:", err));

        // Note: On pourrait aussi loguer l'incident dans une table `Incident` ou envoyer une alerte au bailleur.
      }
    }

    return NextResponse.json({ success: true, count: detectedCount, period: periodMonth }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron Impayés] Erreur globale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
