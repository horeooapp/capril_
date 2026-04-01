"use server";
// QAPRIL - Passeport Locatif ICL - Score sur 1000 pts

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

const SCORE_DEPART = 750;

// Calculer le score ICL d'un locataire
export async function calculerScoreICL(locataireId: string) {
  const events = await prisma.iclEvent.findMany({
    where:   { userId: locataireId },
    orderBy: { createdAt: "asc" }
  });
  const delta = events.reduce((s, e) => s + e.points, 0);
  const score = Math.min(1000, Math.max(0, SCORE_DEPART + delta));

  // Calcul du badge
  const badge = score >= 900 ? "A+" : score >= 800 ? "A"
    : score >= 700 ? "B+" : score >= 600 ? "B" : "C";

  // Mettre a jour LocataireProfile
  await prisma.locataireProfile.upsert({
    where:  { userId: locataireId },
    update: { scoreActuel: score, scoreBadge: badge, scoreCalculeAt: new Date() },
    create: { userId: locataireId, scoreActuel: score, scoreBadge: badge, scoreCalculeAt: new Date() }
  });

  return { score, badge, delta };
}

// Ajouter un evenement ICL (bonus/malus)
export async function ajouterEvenementICL(data: {
  userId:      string;
  type:        string; // KYC_BONUS|PUNCTUALITY|LATE_PENALTY|LONG_TERM_BONUS
  points:      number; // positif=bonus, negatif=malus
  description?: string;
}) {
  await prisma.iclEvent.create({ data });
  return calculerScoreICL(data.userId);
}

// Bonus KYC : +50 pts quand KYC complet (3 docs)
export async function appliquerBonusKYC(userId: string) {
  // Verifier que le bonus n'a pas deja ete accorde
  const dejaAccorde = await prisma.iclEvent.findFirst({
    where: { userId, type: "KYC_BONUS" }
  });
  if (dejaAccorde) return { alreadyGranted: true };
  return ajouterEvenementICL({
    userId, type: "KYC_BONUS", points: 50,
    description: "KYC complet - 3 documents verifies"
  });
}

// Generer le passeport locatif
export async function genererPasseport(locataireId: string) {
  const { score, badge } = await calculerScoreICL(locataireId);

  const leases = await prisma.lease.findMany({
    where:   { tenantId: locataireId },
    include: { property: { select: { commune: true, propertyCode: true } },
               receipts: { where: { status: "paid" }, select: { totalAmount: true } } }
  });

  const tauxPaiement = leases.length > 0
    ? leases.filter(l => l.receipts.length > 0).length / leases.length
    : 0;

  const ref = "PASS-" + Date.now().toString(36).toUpperCase();
  const snapshot = leases.map(l => ({
    bail:      l.id,
    commune:   l.property.commune,
    quittances: l.receipts.length
  }));
  const sha256 = createHash("sha256").update(JSON.stringify({
    ref, locataireId, score, snapshot
  })).digest("hex");

  return prisma.passeportLocatif.create({
    data: {
      locataireId,
      refPasseport:         ref,
      scoreGlobal:          score,
      tauxPaiementGlobal:   tauxPaiement,
      nbBailsInclus:        leases.length,
      periodeCouverteDebut: leases.length > 0
        ? leases.sort((a,b) => a.startDate.getTime()-b.startDate.getTime())[0].startDate
        : new Date(),
      periodeCouverteFin:   new Date(),
      snapshotBails:        snapshot,
      hashSha256:           sha256,
      expireAt:             new Date(Date.now() + 365*24*3600*1000),
    }
  });
}

// Profil public locataire
export async function getProfilLocataire(locataireId: string) {
  return prisma.locataireProfile.findUnique({
    where: { userId: locataireId }
  });
}
