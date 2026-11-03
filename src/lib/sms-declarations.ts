import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { generateReceiptRef } from "@/lib/receipt";
import { generateProofHash } from "@/lib/proof";
import { scoreRentPayment } from "@/lib/scoring";
import { DeclStatut } from "@prisma/client";

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

