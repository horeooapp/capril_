"use server";
// QAPRIL — Server Actions Baux · Basé sur schema.prisma reçu
// Modèle : Lease · Champs exacts du schema

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";

// ── Créer un bail ────────────────────────────────────────
export async function createLease(data: {
  propertyId:    string;
  landlordId:    string;
  tenantId?:     string;
  agentId?:      string;
  mandateId?:    string;
  startDate:     Date;
  endDate?:      Date;
  durationMonths: number;
  rentAmount:    number;   // Int FCFA
  chargesAmount?: number;  // Int FCFA
  paymentDay?:   number;   // défaut 5
  depositAmount?: number;  // Int FCFA
  typeBail?:     string;   // "ECRIT" | "DECLARATIF_BDQ"
}) {
  const ref = `BAIL-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

  // Calcul SHA-256 RG-BAIL-03
  const payload = JSON.stringify({
    ref, propertyId: data.propertyId, landlordId: data.landlordId,
    tenantId: data.tenantId, rentAmount: data.rentAmount,
    startDate: data.startDate, durationMonths: data.durationMonths
  });
  const sha256 = createHash("sha256").update(payload).digest("hex");

  // Facturation 2 000 FCFA — débiter wallet bailleur
  await (prisma as any).userWalletConfig.update({
    where: { userId: data.landlordId },
    data:  { walletBalance: { decrement: 2000 } }
  });

  const lease = await prisma.lease.create({
    data: {
      leaseReference: ref,
      propertyId:     data.propertyId,
      landlordId:     data.landlordId,
      tenantId:       data.tenantId,
      agentId:        data.agentId,
      mandateId:      data.mandateId,
      startDate:      data.startDate,
      endDate:        data.endDate,
      durationMonths: data.durationMonths,
      rentAmount:     data.rentAmount,
      chargesAmount:  data.chargesAmount ?? 0,
      paymentDay:     data.paymentDay    ?? 5,
      depositAmount:  data.depositAmount ?? 0,
      typeBail:       data.typeBail      ?? ("ECRIT" as any),
      status:         "DRAFT",
    }
  });

  revalidatePath("/dashboard");
  return { success: true, lease, sha256 };
}

// ── Récupérer les baux d'un bailleur ─────────────────────
export async function getLeasesForLandlord(landlordId: string) {
  return prisma.lease.findMany({
    where: { landlordId, status: { not: "ARCHIVED" } },
    include: {
      property: { select: { commune: true, address: true, propertyCode: true } },
      tenant:   { select: { firstName: true, lastName: true, phone: true } },
      receipts: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });
}

// ── Récupérer un bail par ID ──────────────────────────────
export async function getLeaseById(leaseId: string) {
  return prisma.lease.findUnique({
    where:   { id: leaseId },
    include: {
      property: true,
      landlord: { select: { firstName: true, lastName: true, phone: true, walletConfig: { select: { landlordCode: true } } } },
      tenant:   { select: { firstName: true, lastName: true, phone: true } },
      mandate:  true,
      receipts: { orderBy: { createdAt: "desc" } }
    }
  });
}

// ── Récupérer les baux d'un locataire ────────────────────
export async function getLeasesForTenant(tenantId: string) {
  return prisma.lease.findMany({
    where: { tenantId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
    include: {
      property: { select: { commune: true, address: true, propertyCode: true } },
      receipts: { orderBy: { periodMonth: "desc" }, take: 6 }
    }
  });
}

// ── Compter baux actifs pour wallet ADD-07 v3 ────────────
export async function countActiveLeasesForLandlord(landlordId: string) {
  return prisma.lease.count({
    where: { landlordId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } }
  });
}
