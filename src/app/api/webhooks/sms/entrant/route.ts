import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { PaymentCanal, DeclStatut } from "@prisma/client";

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
 * ADD-11 Section 3.1 — Analyse syntaxique SMS de déclaration locataire
 * Formats acceptés :
 * - PAYE [montant] (ex: PAYE 35000)
 * - PAYE (montant habituel du bail actif)
 * - LOYA / LOYA [montant]
 * - QUITTANCE
 * - J'AI PAYE / JAI PAYE
 */
export function parseTenantSmsDeclaration(
  rawText: string,
  defaultRentAmount: number
): { valid: boolean; amount: number; keyword?: string } {
  const cleaned = rawText.trim();
  const upper = cleaned.toUpperCase();

  const isDeclarationIntent =
    /\b(PAY[EÉ]|LOYA|LOYER|QUITTANCE|J\s*['’]?\s*AI\s+PAY[EÉ])\b/i.test(upper);

  if (!isDeclarationIntent) {
    return { valid: false, amount: 0 };
  }

  // Chercher un montant explicite dans le SMS (ex: "PAYE 35000" ou "J'AI PAYE 35 000")
  const amountMatch = cleaned.match(/(\d{1,3}(?:[\s.]\d{3})+|\d{4,7})/);
  if (amountMatch) {
    const parsed = parseInt(amountMatch[1].replace(/[\s.]/g, ""), 10);
    if (parsed >= 1000) {
      return { valid: true, amount: parsed, keyword: "MONTANT_EXPLICITE" };
    }
  }

  // R11-UAT-04 : Sans montant explicite -> utiliser le loyer mensuel enregistré du bail actif
  return {
    valid: true,
    amount: Number(defaultRentAmount || 0),
    keyword: "MONTANT_HABITUEL_BAIL",
  };
}

/**
 * DCL-01 — POST /api/webhooks/sms/entrant
 * Webhook opérateur · reçoit le SMS brut du locataire · parse et crée la déclaration
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
      return NextResponse.json({ error: "Missing payload (from, text)" }, { status: 400 });
    }

    const candidates = buildPhoneCandidates(from);
    const tenant = await prisma.user.findFirst({
      where: { phone: { in: candidates } },
    });

    if (!tenant) {
      await sendSMS(from, "QAPRIL : Votre numéro n'est pas reconnu. Veuillez contacter votre bailleur.").catch(() => null);
      return NextResponse.json({ status: "ignored_unknown_user" });
    }

    // Recherche du bail actif (formel ou déclaratif)
    const lease = await prisma.lease.findFirst({
      where: {
        tenantId: tenant.id,
        status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any },
      },
      include: {
        property: {
          include: {
            owner: true,
            accessRoles: {
              where: {
                role: { in: ["MANAGER", "INTERMEDIAIRE"] as any },
                statut: "ACTIF",
              },
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lease) {
      await sendSMS(from, "QAPRIL : Aucun bail actif trouvé pour votre compte.").catch(() => null);
      return NextResponse.json({ status: "ignored_no_lease" });
    }

    const parsed = parseTenantSmsDeclaration(text, lease.rentAmount);
    if (!parsed.valid || parsed.amount <= 0) {
      await sendSMS(
        from,
        "QAPRIL : Envoyez 'PAYE' ou 'PAYE [montant]' (ex: PAYE 35000) pour réclamer votre quittance."
      ).catch(() => null);
      return NextResponse.json({ status: "invalid_format" });
    }

    const amount = parsed.amount;
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h (ADD-11 Section 3.3)

    const declaration = await prisma.smsDeclaration.create({
      data: {
        leaseId: lease.id,
        tenantId: tenant.id,
        montantDeclare: amount,
        canal: PaymentCanal.SMS_DECLARATIF,
        statut: DeclStatut.EN_ATTENTE,
        smsBrut: text,
        expireAt,
      },
    });

    const refDcl = `DCL-${new Date().getFullYear()}-${declaration.id.slice(0, 5).toUpperCase()}`;

    // 1. Accusé de réception immédiat au locataire (ADD-11 Section 3.2)
    await sendSMS(
      from,
      `Déclaration reçue. J'envoie une demande de confirmation à votre gestionnaire. Vous recevrez votre quittance dès validation. Réf : ${refDcl}`
    ).catch(() => null);

    // 2. Notification au(x) gestionnaire(s) actif(s), ou au propriétaire s'il n'y a pas de gestionnaire
    const managers = lease.property?.accessRoles || [];
    const recipients =
      managers.length > 0
        ? managers.map((m) => m.user).filter(Boolean)
        : lease.property?.owner
        ? [lease.property.owner]
        : [];

    const tenantName =
      [tenant.firstName, tenant.lastName].filter(Boolean).join(" ").trim() || tenant.phone || "Votre locataire";
    const unitLabel = lease.property?.unitLabel || lease.property?.name || lease.property?.address || "Logement";
    const alertMsg = `QAPRIL : ${tenantName} (${unitLabel}) déclare avoir payé ${amount.toLocaleString("fr-FR")} FCFA ce jour. Confirmez-vous ? Répondez OUI ou NON.`;

    for (const recipient of recipients) {
      if (recipient?.phone) {
        await sendSMS(recipient.phone, alertMsg).catch(() => null);
      }
    }

    return NextResponse.json({
      status: "success",
      declarationId: declaration.id,
      reference: refDcl,
      amount,
      amountSource: parsed.keyword,
    });
  } catch (error) {
    console.error("[DCL-01 SMS WEBHOOK ERROR]:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
