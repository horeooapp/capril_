import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/conversational/conversation-engine";
import { CnvTransportType } from "@/lib/conversational/types";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET: Webhook verification (ex: Meta WhatsApp Cloud API / Messenger)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken) {
    console.error("[WHATSAPP WEBHOOK] Erreur: WHATSAPP_VERIFY_TOKEN non défini dans l'environnement.");
    return NextResponse.json({ error: "Webhook verify token not configured" }, { status: 500 });
  }

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden - Invalid token or mode" }, { status: 403 });
}

/**
 * POST: Réception des messages entrants (WhatsApp Business API, OpenWA, SMS Aggregator)
 * Moteur universel RG-CNV-02
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.CONVERSATIONAL_SECRET;
    const signature = request.headers.get("x-hub-signature-256");

    // Si un secret est configuré, valider obligatoirement l'intégrité et la signature
    if (appSecret) {
      if (!signature) {
        console.error("[CONVERSATIONAL WEBHOOK] Rejet: x-hub-signature-256 manquant.");
        return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
      }

      const cleanSig = signature.startsWith("sha256=") ? signature.slice(7) : signature;
      const expectedSig = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

      const sigBuffer = Buffer.from(cleanSig, "utf8");
      const expectedSigBuffer = Buffer.from(expectedSig, "utf8");

      if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
        console.error("[CONVERSATIONAL WEBHOOK] Rejet: Signature non concordante.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = rawBody ? JSON.parse(rawBody) : {};

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

