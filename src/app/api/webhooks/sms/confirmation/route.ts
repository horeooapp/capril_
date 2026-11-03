import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { resolveSmsDeclaration } from "@/lib/sms-declarations";
import { DeclStatut } from "@prisma/client";

function buildPhoneCandidates(rawPhone: string): string[] {
  const digits = String(rawPhone || "").replace(/[^0-9]/g, "");
  const set = new Set<string>([rawPhone, digits, `+${digits}`]);
  if (digits.startsWith("225") && digits.length === 13) {
    const local10 = digits.slice(3);
    set.add(local10);
    set.add(`+225${local10}`);
    set.add(`+225 ${local10}`);
  } else if (digits.length === 10) {
    set.add(`225${digits}`);
    set.add(`+225${digits}`);
    set.add(`+225 ${digits}`);
  }
  return Array.from(set).filter(Boolean);
}

/**
 * DCL-02 — POST /api/webhooks/sms/confirmation
 * Webhook opérateur · reçoit la réponse OUI/NON du gestionnaire ou propriétaire
 */
export async function POST(req: NextRequest) {
  try {
    let from = "";
    let text = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("form-data") || contentType.includes("url-encoded")) {
      const formData = await req.formData();
      from = formData.get("from")?.toString() || "";
      text = formData.get("text")?.toString() || "";
    } else {
      const body = await req.json();
      from = body.from || body.sender || "";
      text = body.text || body.content || body.body || "";
    }

    if (!from || !text) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const decision = text.trim().toUpperCase();
    if (decision !== "OUI" && decision !== "NON") {
      return NextResponse.json({ status: "ignored_not_confirmation" });
    }

    const candidates = buildPhoneCandidates(from);
    const sender = await prisma.user.findFirst({
      where: { phone: { in: candidates } },
    });
    if (!sender) {
      return NextResponse.json({ status: "unknown_sender" });
    }

    const declaration = await prisma.smsDeclaration.findFirst({
      where: {
        statut: DeclStatut.EN_ATTENTE,
        lease: {
          OR: [
            { landlordId: sender.id },
            { property: { ownerUserId: sender.id } },
            {
              property: {
                accessRoles: {
                  some: {
                    userId: sender.id,
                    statut: "ACTIF",
                    role: { in: ["MANAGER", "INTERMEDIAIRE", "OWNER"] as any },
                  },
                },
              },
            },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!declaration) {
      await sendSMS(from, "QAPRIL : Aucune déclaration en attente n'a été trouvée pour vos biens.").catch(() => null);
      return NextResponse.json({ status: "no_pending_declaration" });
    }

    const result = await resolveSmsDeclaration({
      declarationId: declaration.id,
      actorUserId: sender.id,
      decision: decision as "OUI" | "NON",
    });

    if (decision === "OUI") {
      await sendSMS(from, `QAPRIL : Paiement confirmé. Quittance ${result.receiptRef} générée.`).catch(() => null);
    } else {
      await sendSMS(from, "QAPRIL : Contestation enregistrée. Le locataire a été prévenu.").catch(() => null);
    }

    return NextResponse.json({ status: "success", ...result });
  } catch (error) {
    console.error("[DCL-02 SMS CONFIRMATION ERROR]:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
