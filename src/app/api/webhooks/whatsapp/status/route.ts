import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

/**
 * AGT-02 — POST /api/webhooks/whatsapp/status
 * Webhook statut livraison messages WhatsApp (sent, delivered, read, failed)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifyMetaSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Signature HMAC invalide" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses || body?.statuses || [];

    for (const st of statuses) {
      const recipient = st.recipient_id;
      const status = String(st.status || "").toUpperCase(); // SENT, DELIVERED, READ, FAILED

      if (recipient && status) {
        await prisma.bdqSmsLog
          .updateMany({
            where: { destinataire: { contains: recipient.slice(-8) } },
            data: { statutEnvoi: status },
          })
          .catch(() => null);
      }
    }

    return NextResponse.json({ success: true, processed: statuses.length }, { status: 200 });
  } catch (error: any) {
    console.error("[AGT-02 WhatsApp Status Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

