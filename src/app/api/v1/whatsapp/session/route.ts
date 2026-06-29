import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: Initialiser la session WhatsApp (ex: associer tel -> agent -> bailleur)
    
    return NextResponse.json({ success: true, sessionId: `WA-SESS-${Date.now()}` });
  } catch (error) {
    console.error("Erreur Session WA-02:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
