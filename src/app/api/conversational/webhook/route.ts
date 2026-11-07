import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/conversational/conversation-engine";
import { CnvTransportType } from "@/lib/conversational/types";

export const dynamic = "force-dynamic";

/**
 * GET: Webhook verification (ex: Meta WhatsApp Cloud API / Messenger)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "qapril_webhook_token_2026";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "QAPRIL Conversational Webhook Active" }, { status: 200 });
}

/**
 * POST: Réception des messages entrants (WhatsApp Business API, OpenWA, SMS Aggregator)
 * Moteur universel RG-CNV-02
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    let senderPhone = "";
    let messageText = "";
    let transport: CnvTransportType = "WHATSAPP";
    let messageId: string | undefined = undefined;

    // 1. Détection format WhatsApp Business Cloud API (Meta)
    if (body.object === "whatsapp_business_account" || body.entry) {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        senderPhone = message.from;
        messageId = message.id;

        if (message.type === "text") {
          messageText = message.text?.body || "";
        } else if (message.type === "button") {
          messageText = message.button?.text || message.button?.payload || "";
        } else if (message.type === "interactive") {
          messageText =
            message.interactive?.button_reply?.title ||
            message.interactive?.button_reply?.id ||
            message.interactive?.list_reply?.title ||
            "";
        }
      }
    }
    // 2. Détection format OpenWA
    else if (body.event === "message" || body.sender?.id) {
      senderPhone = body.sender?.id?.replace(/@c\.us$/, "") || body.from || "";
      messageText = body.body || body.text || "";
      transport = "WHATSAPP";
    }
    // 3. Détection format SMS Aggregator standard (Orange, MTN, Wave, Infobip)
    else if (body.from || body.sender || body.msisdn) {
      senderPhone = body.from || body.sender || body.msisdn || "";
      messageText = body.text || body.message || body.body || "";
      transport = body.transport === "SMS" ? "SMS" : "WHATSAPP";
      messageId = body.messageId || body.id;
    }

    if (!senderPhone || !messageText) {
      return NextResponse.json(
        { error: "Payload invalide ou incomplet (expéditeur ou texte manquant)" },
        { status: 400 }
      );
    }

    // Traitement par le moteur conversationnel ADD-26
    const result = await handleIncomingMessage({
      numero: senderPhone,
      texteBrut: messageText,
      transport,
      referenceMessage: messageId
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("[CONVERSATIONAL_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement conversationnel", details: error.message },
      { status: 500 }
    );
  }
}

