"use server";
// QAPRIL — Dashboard Bailleur & Locataire

import { prisma } from "@/lib/prisma";

const SEUIL_WALLET = Number(process.env.QAPRIL_WALLET_SEUIL_DEFAUT ?? 1000);

// ── Dashboard bailleur complet ────────────────────────────
export async function getDashboardBailleur(landlordId: string) {
  const [user, leases, recentReceipts] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: landlordId },
      include: { walletConfig: true }
    }),
    prisma.lease.findMany({
      where:   { landlordId, status: { not: "ARCHIVED" } },
      include: {
        property: { select: { commune: true, address: true, propertyCode: true } },
        tenant:   { select: { firstName: true, lastName: true, phone: true } },
        receipts: { orderBy: { periodMonth: "desc" }, take: 1 }
      }
    }),
    prisma.receipt.findMany({
      where:   { lease: { landlordId }, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      orderBy: { createdAt: "desc" },
      take:    20
    })
  ]);

  const actifs  = leases.filter(l => ["ACTIVE","ACTIVE_DECLARATIF"].includes(l.status));
  const vacants = leases.filter(l => l.property && ["ACTIVE","LOYER_IMPAYE"].includes(l.status)).length;
  const loyer   = actifs.reduce((s, l) => s + l.rentAmount, 0);

  // Taux de recouvrement mois courant
  const dus  = actifs.length;
  const pays = recentReceipts.filter(r => r.status === "paid").length;
  const taux = dus > 0 ? Math.round((pays / dus) * 100) : 100;

  // Alertes
  const alertes = [];
  const seuil   = user?.walletConfig?.walletSeuilAlerte ?? SEUIL_WALLET;
  if (((user?.walletConfig?.walletBalance || 0) ?? 0) < seuil) {
    alertes.push({ type: "WALLET", message: `Wallet sous seuil ${seuil} FCFA`,
      details: { solde: (user?.walletConfig?.walletBalance || 0), seuil } });
  }

  return {
    walletBalance:      (user?.walletConfig?.walletBalance || 0) ?? 0,
    walletSeuilAlerte:  seuil,
    biensActifs:        actifs.length,
    biensVacants:       vacants,
    loyersMensuels:     loyer,
    tauxRecouvrement:   taux,
    quittancesGenerees: recentReceipts.filter(r => r.status === "paid").length,
    alertes,
    leases,
    recentReceipts
  };
}

// ── Dashboard locataire ───────────────────────────────────
export async function getDashboardLocataire(tenantId: string) {
  const lease = await prisma.lease.findFirst({
    where:   { tenantId, status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "DRAFT", "PENDING_SIGNATURE", "PENDING_CONFIRMATION", "LOYER_IMPAYE"] } },
    include: {
      property: true,
      receipts: { orderBy: { periodMonth: "desc" }, take: 6 }
    }
  });
  if (!lease) return null;

  // Prochain paiement : mois suivant le dernier paiement
  const dernierPaye = lease.receipts.find(r => r.status === "paid");
  let prochainMois = "";
  if (dernierPaye) {
    const [y, m] = dernierPaye.periodMonth.split("-").map(Number);
    const next = new Date(y, m); // mois suivant
    prochainMois = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;
  }

  return { lease, prochainMois, receipts: lease.receipts };
}
