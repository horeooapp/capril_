import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { generateReceiptRef } from "@/lib/receipt";
import { generateProofHash } from "@/lib/proof";
import { scoreRentPayment } from "@/lib/scoring";
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
 * Exécute la confirmation ou contestation d'une SmsDeclaration (utilisé par DCL-02, DCL-04 et DCL-05)
 */
export async function resolveSmsDeclaration(params: {
  declarationId: string;
  actorUserId: string;
  decision: "OUI" | "NON";
  motif?: string;
}) {
  const { declarationId, actorUserId, decision, motif } = params;

  const declaration = await prisma.smsDeclaration.findUnique({
    where: { id: declarationId },
    include: {
      tenant: true,
      lease: {
        include: {
          property: { include: { owner: true } },
        },
      },
    },
  });

  if (!declaration) {
    throw new Error("Déclaration introuvable.");
  }

  const actor = await prisma.user.findUnique({ where: { id: actorUserId } });
  const actorName = [actor?.firstName, actor?.lastName].filter(Boolean).join(" ").trim() || "Gestionnaire";
  const tenantName =
    [declaration.tenant.firstName, declaration.tenant.lastName].filter(Boolean).join(" ").trim() ||
    declaration.tenant.phone ||
    "Locataire";
  const unitLabel =
    declaration.lease.property?.unitLabel ||
    declaration.lease.property?.name ||
    declaration.lease.property?.address ||
    "Logement";
  const amount = Number(declaration.montantDeclare);

  if (decision === "OUI") {
    const periodMonth = new Date().toISOString().slice(0, 7);
    const receiptRef = await generateReceiptRef();
    const documentHash = await generateProofHash({
      receiptRef,
      leaseId: declaration.leaseId,
      totalAmount: amount,
      period: periodMonth,
      receiptType: "RENT",
    });

    const receipt = await prisma.receipt.create({
      data: {
        receiptRef,
        leaseId: declaration.leaseId,
        periodMonth,
        rentAmount: amount,
        chargesAmount: 0,
        totalAmount: amount,
        paymentMethod: "CASH",
        paymentRef: "SMS_DECLARATION",
        paidAt: new Date(),
        receiptHash: documentHash,
        status: "paid",
        declarative: true,
      },
    });

    await prisma.smsDeclaration.update({
      where: { id: declaration.id },
      data: {
        statut: DeclStatut.CONFIRME,
        confirmeParId: actorUserId,
        confirmeAt: new Date(),
        receiptId: receipt.id,
      },
    });

    // Mise à jour du score ICL
    try {
      const [year, month] = periodMonth.split("-").map(Number);
      const dueDate = new Date(year, month - 1, declaration.lease.paymentDay || 5);
      const diffDays = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      await scoreRentPayment(declaration.tenantId, diffDays, receipt.id);
    } catch {}

    // Notifications (ADD-11 Section 3.2 : Locataire + Propriétaire + Gestionnaire)
    if (declaration.tenant.phone) {
      await sendSMS(
        declaration.tenant.phone,
        `✅ Quittance confirmée ! Loyer ${periodMonth} · ${amount.toLocaleString("fr-FR")} FCFA · ${unitLabel}. Réf : ${receiptRef}.`
      ).catch(() => null);
    }

    const owner = declaration.lease.property?.owner;
    if (owner?.phone && owner.id !== actorUserId) {
      const nowStr = new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      await sendSMS(
        owner.phone,
        `✅ Paiement confirmé : ${tenantName} · ${amount.toLocaleString("fr-FR")} FCFA · ${unitLabel} · Confirmé par ${actorName} le ${nowStr}.`
      ).catch(() => null);
    }

    return {
      success: true,
      statut: "CONFIRME",
      receiptId: receipt.id,
      receiptRef,
    };
  } else {
    // CONTESTATION (R11-UAT-10)
    await prisma.smsDeclaration.update({
      where: { id: declaration.id },
      data: {
        statut: DeclStatut.CONTESTE,
        confirmeParId: actorUserId,
        confirmeAt: new Date(),
      },
    });

    if (declaration.tenant.phone) {
      await sendSMS(
        declaration.tenant.phone,
        "QAPRIL : Votre déclaration a été contestée. Contactez votre propriétaire."
      ).catch(() => null);
    }

    const owner = declaration.lease.property?.owner;
    if (owner?.phone && owner.id !== actorUserId) {
      await sendSMS(
        owner.phone,
        `⚠️ QAPRIL : La déclaration de paiement de ${tenantName} (${amount.toLocaleString("fr-FR")} FCFA) a été contestée par ${actorName}${motif ? ` (${motif})` : ""}.`
      ).catch(() => null);
    }

    return {
      success: true,
      statut: "CONTESTE",
    };
  }
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
