import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { calculateSuggestedRecharge } from "@/lib/wallet/calculator";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const options = await calculateSuggestedRecharge(session.user.id);
    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
