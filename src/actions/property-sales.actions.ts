"use server";

import { prisma } from "@/lib/prisma";

// ── Phase 3: Préemption et Vente (Art. 446 CCH) ──

export async function initierVenteLogement(propertyId: string, prixVenteFcfa: number) {
  // Check if there is an active lease
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { leases: { where: { status: "ACTIVE" } } }
  });

  if (!property) throw new Error("Logement introuvable");

  let preemptionNotifieeAt = null;

  if (property.leases.length > 0) {
    // Si locataire actif, la loi impose de le notifier.
    preemptionNotifieeAt = new Date();
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      enVente: true,
      prixVenteFcfa,
      preemptionNotifieeAt,
      locataireRenoncePreemption: false
    }
  });
}

export async function renoncerAchatLogement(propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new Error("Logement introuvable");

  if (!property.enVente || !property.preemptionNotifieeAt) {
    throw new Error("Aucune procédure de préemption en cours.");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      locataireRenoncePreemption: true
    }
  });
}
