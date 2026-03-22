import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateReliabilityScore } from "@/lib/reliability";

/**
 * Route exécutée par un Cron le 1er ou le dernier jour du mois.
 * Re-calcule le Score Locatif pour tous les locataires actifs.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !vercelCron) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Récupérer les locataires ayant au moins 1 bail actif
    const tenants = await prisma.user.findMany({
      where: {
        leasesAsTenant: {
          some: {
            status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] }
          }
        }
      },
      select: { id: true }
    });

    let count = 0;
    for (const tenant of tenants) {
      await calculateReliabilityScore(tenant.id).catch(err => console.error(`Failed to score ${tenant.id}`, err));
      count++;
    }

    return NextResponse.json({ success: true, count }, { status: 200 });

  } catch (error: any) {
    console.error("[Cron Scoring] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
