import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateDiasporaInvite } from "@/actions/diaspora-actions";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const result = await generateDiasporaInvite(session.user.id) as any;
  
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
