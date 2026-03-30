import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ChampionService } from "@/lib/champion-service";

/**
 * POST /api/v1/champions/recovery/discovery
 * Triggers the automated scanning of pending receipts to populate the recovery pipeline.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    // Only Champions or Admins can trigger discovery
    if (!session?.user || !["CHAMPION", "ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const result = await ChampionService.discoverArrears();
    
    return NextResponse.json({
      success: true,
      message: `${result.created} nouveaux dossiers de recouvrement identifiés.`,
      details: result
    });
  } catch (error: any) {
    console.error("[API_CHAMPION_DISCOVERY]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
