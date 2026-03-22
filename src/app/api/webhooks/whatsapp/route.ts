import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

/**
 * GET: Vérification du Webhook par Meta
 * Requis lors de la configuration du webhook sur l'espace développeur Meta.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp Webhook] Verification successful.");
    return new NextResponse(challenge, { status: 200 }); // Must return plain text challenge
  } else {
    console.warn("[WhatsApp Webhook] Verification failed.");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

/**
 * POST: Réception des messages WhatsApp Entrants (Agent-BDQ)
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Validate Meta Signature using APP_SECRET 
    // const signature = req.headers.get("x-hub-signature-256");

    const body = await req.json();

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from; 
        const msg_body = body.entry[0].changes[0].value.messages[0].text.body; 

        console.log(`[WhatsApp Inbound] Message from ${from}: ${msg_body}`);

        // 1. Trouver l'utilisateur QAPRIL par son numéro
        const user = await prisma.user.findUnique({ where: { phone: from } });
        if (!user) {
            // Optionnel: Réponse automatique pour les inconnus
            return NextResponse.json({ success: true });
        }

        // 2. Traiter avec l'Agent IA (M-WA-RECLAMATION / BDQ)
        const { processAiBdqMessage } = await import("@/actions/bdq-ai");
        const aiResponse = await processAiBdqMessage(`wa_${from}`, msg_body, user.id);

        // 3. Envoyer la réponse via l'API Meta
        const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        if (WHATSAPP_TOKEN && aiResponse.message) {
            await fetch(`https://graph.facebook.com/v17.0/${phone_number_id}/messages`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: aiResponse.message }
                })
            });
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not a WhatsApp API event" }, { status: 404 });
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error parsing POST body:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
