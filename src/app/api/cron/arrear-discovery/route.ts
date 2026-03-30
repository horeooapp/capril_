import { NextResponse } from "next/server";
import { ChampionService } from "@/lib/champion-service";

/**
 * GET /api/cron/arrear-discovery
 * Automated Daily Task to scan for pending receipts and populate the recovery pipeline.
 * Triggered via Vercel Cron, GitHub Actions, or local curl with CRON_SECRET.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // Security check: Match bearer token with environment variable
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.info("[CRON] Starting Arrear Discovery...");
    const result = await ChampionService.discoverArrears();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error("[CRON_ARREAR_DISCOVERY_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
