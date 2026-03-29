import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ChampionService } from "@/lib/champion-service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "CHAMPION") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const arrears = await ChampionService.getRecoveryList(session.user.id);
    
    // Sort and prioritize: Higher amounts and oldest arrears first
    const sorted = arrears.sort((a, b) => {
      if (a.amount !== b.amount) return b.amount - a.amount;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return NextResponse.json(sorted);
  } catch (error: any) {
    console.error("[API_CHAMPION_RECOVERY_LIST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
