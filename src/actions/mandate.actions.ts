"use server";
// QAPRIL — Server Actions Mandats · RG-MAN-01 à 03 · RG-DEL-01 à 03

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Créer un mandat agence agréée ─────────────────────────
export async function createMandateAgreee(data: {
  propertyId:    string;
  agentUserId:   string;
  commissionPct?: number;
  startDate:     Date;
  endDate?:      Date;
}) {
  const ref = `M-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
  const mandate = await prisma.mandate.create({
    data: {
      mandateRef:   ref,
      propertyId:   data.propertyId,
      agentUserId:  data.agentUserId,
      mandateType:  "EXCLUSIVE",   // Substitution totale · RG-MAN-01
      commissionPct: data.commissionPct,
      startDate:    data.startDate,
      endDate:      data.endDate,
      status:       "ACTIVE"
    }
  });
  // Masquer le bailleur sur ce bien — RG-MAN-01
  await prisma.property.update({
    where: { id: data.propertyId },
    data:  { managementMode: "AGENCY" }
  });
  revalidatePath("/dashboard");
  return mandate;
}

// ── Révoquer un mandat (J+8 pour agréée) ─────────────────
export async function revokeMandate(mandateId: string, revokedByUserId: string, reason?: string) {
  const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
  if (!mandate) throw new Error("Mandat introuvable");

  // Révocation immédiate — statut CANCELLED
  // La logique J+8 est gérée côté frontend/CRON
  await prisma.mandate.update({
    where: { id: mandateId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledByUserId: revokedByUserId,
      cancelReason: reason
    }
  });
  // Logger dans mandate_history
  await prisma.mandateHistory.create({
    data: {
      propertyId:  mandate.propertyId,
      mandateId,
      agentUserId: mandate.agentUserId,
      mandateType: mandate.mandateType,
      startDate:   mandate.startDate,
      endDate:     new Date()
    }
  });
  revalidatePath("/dashboard");
}

// ── Mandats actifs d'un bien ──────────────────────────────
export async function getMandatesForProperty(propertyId: string) {
  return prisma.mandate.findMany({
    where:   { propertyId, status: { in: ["ACTIVE","DRAFT"] } },
    include: { agent: { select: { fullName: true, phone: true, agenceProfile: true } } },
    orderBy: { startDate: "desc" }
  });
}
