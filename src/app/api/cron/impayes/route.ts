import { verifyCronAuth } from "@/lib/security";
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

    const today = new Date();
    const periodMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    console.log(`[Cron Impayés] Exécution de l'ArrearsEngine pour ${periodMonth}`);

    // 3. Déléguer au moteur d'escalade P1
    const { discoverAndEscalateArrears } = await import("@/lib/arrears-engine");
    const escalationsCount = await discoverAndEscalateArrears();

    return NextResponse.json({ 
        success: true, 
        escalations: escalationsCount, 
        period: periodMonth 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron Impayés] Erreur globale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
