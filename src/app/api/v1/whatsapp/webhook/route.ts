import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "QAPRIL_SECRET_TOKEN";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Retourne le challenge en texte brut
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("Erreur Webhook WA-01 GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Vérification de la structure Meta
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            const message = change.value.messages[0];
            // const phoneNumber = message.from;
            // const messageText = message.text?.body;
            
            // TODO: Logique de traitement (ex: Identifier le bailleur/locataire)
            console.log(`Message reçu de ${message.from}: ${message.text?.body}`);
          }
        }
      }
      return NextResponse.json({ status: "OK" });
    }

    return NextResponse.json({ status: "IGNORED" });
  } catch (error) {
    console.error("Erreur Webhook WA-01 POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
