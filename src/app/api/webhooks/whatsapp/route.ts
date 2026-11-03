import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { processAiBdqMessage } from "@/actions/bdq-ai";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WA_VERIFY_TOKEN || "QAPRIL_SECRET_TOKEN";
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || process.env.WA_APP_SECRET;

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET || APP_SECRET === "fallback_secret") return true;
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

function buildPhoneCandidates(rawPhone: string): string[] {
  const digits = String(rawPhone || "").replace(/[^0-9]/g, "");
  const candidates = new Set<string>([rawPhone, digits, `+${digits}`]);
  if (digits.startsWith("225") && digits.length === 13) {
    const local10 = digits.slice(3);
    candidates.add(local10);
    candidates.add(`+225${local10}`);
    candidates.add(`+225 ${local10}`);
  } else if (digits.length === 10) {
    candidates.add(`225${digits}`);
    candidates.add(`+225${digits}`);
    candidates.add(`+225 ${digits}`);
  }
  return Array.from(candidates).filter(Boolean);
}

async function sendWhatsAppReply(to: string, text: string, phoneNumberId?: string) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WA_ACCESS_TOKEN;
  const targetPhoneId = phoneNumberId || process.env.WA_PHONE_NUMBER_ID;

  if (WHATSAPP_TOKEN && targetPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${targetPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      });
      if (res.ok) return;
    } catch (e) {
      console.error("[AGT-01] Erreur envoi Meta WhatsApp API:", e);
    }
  }

  // Fallback OpenWA
  try {
    const { sendOpenWAMessage } = await import("@/lib/openwa");
    await sendOpenWAMessage(to, text);
  } catch {
    // Fallback silencieux en environnement de test
  }
}

/**
 * AGT-01 (GET): Vérification du Webhook par Meta
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * AGT-01 (POST): Réception des messages WhatsApp Entrants (Agent-BDQ ADD-08)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifyMetaSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Signature HMAC invalide" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    let from: string | undefined;
    let msgBody: string | undefined;
    let phoneNumberId: string | undefined;

    // Format Meta WhatsApp Business API
    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const val = body.entry[0].changes[0].value;
      phoneNumberId = val.metadata?.phone_number_id;
      const msgObj = val.messages[0];
      from = msgObj.from;
      msgBody = msgObj.text?.body || msgObj.button?.text || msgObj.interactive?.button_reply?.title;
    } else if (body.from && body.body) {
      // Format direct simplifié (ex: simulateur UAT ADD-08 Section 5)
      from = body.from;
      msgBody = body.body;
    }

    if (!from || !msgBody) {
      return NextResponse.json({ status: "IGNORED" }, { status: 200 });
    }

    const phoneCandidates = buildPhoneCandidates(from);
    const bailleur = await prisma.user.findFirst({
      where: { phone: { in: phoneCandidates } },
    });

    if (!bailleur) {
      const registerMsg = "Inscrivez-vous sur qapril.ci pour commencer.";
      await sendWhatsAppReply(from, registerMsg, phoneNumberId);
      return NextResponse.json({
        success: false,
        status: "UNREGISTERED_USER",
        message: registerMsg,
      });
    }

    const normalizedRef = `wa_${String(from).replace(/[^0-9]/g, "")}`;
    const aiResponse = await processAiBdqMessage(normalizedRef, msgBody, bailleur.id, "WHATSAPP");

    if (aiResponse.message) {
      await sendWhatsAppReply(from, aiResponse.message, phoneNumberId);
    }

    return NextResponse.json(
      {
        success: true,
        conv_id: aiResponse.convId,
        status: aiResponse.status,
        bdq_id: aiResponse.bdqId || null,
        reply: aiResponse.message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AGT-01 WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
