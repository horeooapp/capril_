import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { simulateSepaVirement } from "@/actions/diaspora-actions";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { amountFcfa, currency } = await req.json();
  const result = await simulateSepaVirement(amountFcfa || 0, currency || "EUR");

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
