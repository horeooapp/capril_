"use server";
// QAPRIL - Module ARC La Poste CI - RG-ARC-01 a 04

import { prisma } from "@/lib/prisma";

// Certifier une quittance via La Poste CI
export async function certifierQuittanceARC(receiptId: string, data: {
  deliveryMode: string; // "maposte_number" | "physical_address" | "post_office"
  recipientData: {
    nom:       string;
    adresse?:  string;
    maposteId?: string;
  };
}) {
  const trackingNumber = `CI-POST-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

  // Creer la livraison numerique
  const delivery = await prisma.digitalDelivery.create({
    data: {
      trackingNumber,
      deliveryMode:  data.deliveryMode,
      status:        "submitted",
      recipientData: data.recipientData,
    }
  });

  // Lier a la quittance
  await prisma.receipt.update({
    where: { id: receiptId },
    data:  { digitalDeliveryId: delivery.id }
  });

  return { success: true, trackingNumber, delivery };
}

// Suivre le statut ARC d'une quittance
export async function getStatutARC(receiptId: string) {
  const receipt = await prisma.receipt.findUnique({
    where:   { id: receiptId },
    include: { delivery: true }
  });
  return receipt?.delivery ?? null;
}

// Mettre a jour le statut de livraison (webhook La Poste)
export async function updateStatutLivraison(trackingNumber: string, statut: string) {
  const delivery = await prisma.digitalDelivery.update({
    where: { trackingNumber },
    data:  {
      status:      statut,
      deliveredAt: statut === "delivered" ? new Date() : undefined
    }
  });
  return delivery;
}

// Toutes les quittances certifiees ARC d'un bail
export async function getQuittancesCertifieesARC(leaseId: string) {
  return prisma.receipt.findMany({
    where:   { leaseId, digitalDeliveryId: { not: null } },
    include: { delivery: true },
    orderBy: { createdAt: "desc" }
  });
}
