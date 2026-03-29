import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ChampionService } from "@/lib/champion-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "CHAMPION") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { arrearId, canal } = await req.json();

    if (!arrearId) {
      return NextResponse.json({ error: "Arrear ID requis" }, { status: 400 });
    }

    const result = await ChampionService.triggerChampionRelance(arrearId, session.user.id, canal || "wa");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API_CHAMPION_RELANCE_TRIGGER]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
