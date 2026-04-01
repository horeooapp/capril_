"use server";
// QAPRIL — Server Actions Quittances · 90 FCFA / quittance

import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const PRIX_QUITTANCE = Number(process.env.QAPRIL_QUITTANCE_PRIX_FCFA ?? 90);

// ── Générer une quittance ─────────────────────────────────
export async function createReceipt(data: {
  leaseId:       string;
  periodMonth:   string;  // "YYYY-MM"
  rentAmount:    number;
  chargesAmount?: number;
  paymentMethod: string;  // "MOBILE_MONEY"|"CASH"|"BANK_TRANSFER"
  paymentRef?:   string;
  paidAt?:       Date;
}) {
  // Vérifier ordre chronologique — RG-QUI-ORDRE
  const derniere = await prisma.receipt.findFirst({
    where:   { leaseId: data.leaseId, status: "paid" },
    orderBy: { periodMonth: "desc" }
  });
  if (derniere) {
    const [dy, dm] = derniere.periodMonth.split("-").map(Number);
    const [ny, nm] = data.periodMonth.split("-").map(Number);
    const moisSuivant = new Date(dy, dm - 1 + 1);
    const moisDemande = new Date(ny, nm - 1);
    if (moisDemande < moisSuivant) {
      throw new Error(`RG-QUI-ORDRE: Mois ${data.periodMonth} déjà payé ou antérieur`);
    }
  }

  const ref = `REC-${data.periodMonth}-${randomUUID().slice(0,6).toUpperCase()}`;
  const qrToken = randomUUID();
  const total = data.rentAmount + (data.chargesAmount ?? 0);

  // SHA-256 RG-QUI-02
  const lease = await prisma.lease.findUnique({
    where: { id: data.leaseId },
    select: { landlordId: true, tenantId: true }
  });
  const sha256 = createHash("sha256").update(JSON.stringify({
    leaseId: data.leaseId,
    tenantId: lease?.tenantId,
    montant: total,
    mois: data.periodMonth,
    emetteur: lease?.landlordId
  })).digest("hex");

  // Débiter wallet bailleur — 90 FCFA · mode crédit si solde < 0
  const bailleur = await prisma.user.findUnique({
    where: { id: lease!.landlordId },
    select: { walletBalance: true }
  });
  const creditAllowed = (bailleur?.walletBalance ?? 0) >= -1500;
  if (!creditAllowed) throw new Error("Wallet: crédit maximum (-1 500 FCFA) atteint");

  await prisma.user.update({
    where: { id: lease!.landlordId },
    data:  { walletBalance: { decrement: PRIX_QUITTANCE } }
  });

  const receipt = await prisma.receipt.create({
    data: {
      receiptRef:    ref,
      leaseId:       data.leaseId,
      periodMonth:   data.periodMonth,
      rentAmount:    data.rentAmount,
      chargesAmount: data.chargesAmount ?? 0,
      totalAmount:   total,
      paymentMethod: data.paymentMethod,
      paymentRef:    data.paymentRef,
      paidAt:        data.paidAt ?? new Date(),
      qrToken,
      receiptHash:   sha256,
      status:        "paid",
    }
  });

  revalidatePath("/dashboard");
  return { success: true, receipt, sha256, qrToken };
}

// ── Quittances d'un bail ─────────────────────────────────
export async function getReceiptsForLease(leaseId: string) {
  return prisma.receipt.findMany({
    where:   { leaseId },
    orderBy: { periodMonth: "desc" }
  });
}

// ── Quittances du locataire (espace locataire) ────────────
export async function getReceiptsForTenant(tenantId: string) {
  const leases = await prisma.lease.findMany({
    where: { tenantId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
    select: { id: true }
  });
  return prisma.receipt.findMany({
    where:   { leaseId: { in: leases.map(l => l.id) } },
    orderBy: { periodMonth: "desc" }
  });
}

// ── Vérifier quittance par QR token (page publique) ──────
export async function verifyReceiptByQrToken(qrToken: string) {
  const receipt = await prisma.receipt.findUnique({
    where:   { qrToken },
    include: { lease: { select: { leaseReference: true, rentAmount: true } } }
  });
  if (!receipt) return { valid: false };
  return { valid: true, receiptRef: receipt.receiptRef,
    periodMonth: receipt.periodMonth, totalAmount: receipt.totalAmount,
    sha256: receipt.receiptHash, paidAt: receipt.paidAt };
}
