import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
  try {
    const sessionId = params.id;
    // TODO: Lire l'état d'une conversation dans la DB
    
    return NextResponse.json({ 
      success: true, 
      session: sessionId, 
      etat: "ACTIF", 
      derniereInteraction: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Erreur Etat WA-04:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
