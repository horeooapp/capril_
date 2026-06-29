import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: "Destinataire ou message manquant" }, { status: 400 });
    }

    const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "MOCK_PHONE_ID";
    const WA_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "MOCK_TOKEN";

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message }
    };

    // Appel réel à la Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta API Erreur:", result);
      throw new Error(result.error?.message || "Erreur inconnue Meta API");
    }

    return NextResponse.json({ success: true, message: "Message envoyé avec succès", meta_response: result });
  } catch (error) {
    console.error("Erreur Envoyer WA-03:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
