import { prisma } from "./prisma";

export interface YearlyBilanData {
  ownerName: string;
  year: number;
  totalIncome: number;
  totalMaintenance: number;
  totalUtilities: number;
  grossRevenue: number;
  netRevenue: number;
  estimatedTaxAirsi: number; // 7.5%
  finalResult: number;
  monthlyBreakdown: {
    month: number;
    income: number;
    expenses: number;
  }[];
  propertyBreakdown: {
    propertyId: string;
    propertyName: string;
    income: number;
  }[];
}

export class BilanService {
  /**
   * Aggrège les données financières d'un propriétaire pour une année complète.
   */
  static async aggregateYearlyData(ownerId: string, year: number): Promise<YearlyBilanData> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { propertiesOwned: true }
    });

    if (!owner) throw new Error("Propriétaire introuvable");

    // 1. Revenus Locatifs (Quittances)
    const receipts = await prisma.receipt.findMany({
      where: {
        lease: { property: { ownerUserId: ownerId } },
        paidAt: { gte: startOfYear, lte: endOfYear },
        status: "PAID"
      }
    });

    // 2. Dépenses de Maintenance (Tickets clôturés avec coût)
    const tickets = await prisma.ticketMaintenance.findMany({
      where: {
        logement: { ownerUserId: ownerId },
        statut: { in: ["RESOLU", "CLOTURE"] },
        dateResolution: { gte: startOfYear, lte: endOfYear }
      }
    });

    // 3. Factures Utilities (CIE/SODECI déclarées)
    const utilities = await prisma.factureUtility.findMany({
      where: {
        lease: { property: { ownerUserId: ownerId } },
        createdAt: { gte: startOfYear, lte: endOfYear },
        statut: "PAYEE"
      }
    });

    // --- AGGREGATION ---
    let totalIncome = 0;
    let totalMaintenance = 0;
    let totalUtilities = 0;

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expenses: 0
    }));

    receipts.forEach(r => {
      if (r.paidAt) {
        const month = new Date(r.paidAt!).getMonth();
        totalIncome += r.totalAmount;
        monthlyBreakdown[month].income += r.totalAmount;
      }
    });

    tickets.forEach(t => {
      const cost = t.coutFinal || 0;
      const date = t.dateResolution || t.createdAt;
      const month = new Date(date).getMonth();
      totalMaintenance += cost;
      monthlyBreakdown[month].expenses += cost;
    });

    utilities.forEach(u => {
      totalUtilities += u.montantTotal;
      const month = new Date(u.createdAt).getMonth();
      monthlyBreakdown[month].expenses += u.montantTotal;
    });

    const estimatedTaxAirsi = totalIncome * 0.075;
    const grossRevenue = totalIncome;
    const netRevenue = totalIncome - totalMaintenance - totalUtilities;
    const finalResult = netRevenue - estimatedTaxAirsi;

    // Property Breakdown
    const propertyMap: Record<string, { name: string, income: number }> = {};
    owner.propertiesOwned.forEach(p => {
        propertyMap[p.id] = { name: p.name || p.propertyCode, income: 0 };
    });

    // Recalcul par propriété (pour le tableau interactif)
    const receiptsWithProperty = await prisma.receipt.findMany({
        where: {
          lease: { property: { ownerUserId: ownerId } },
          paidAt: { gte: startOfYear, lte: endOfYear },
          status: "PAID"
        },
        include: { lease: { include: { property: true } } }
    });

    receiptsWithProperty.forEach(r => {
        const pId = r.lease.propertyId;
        if (propertyMap[pId]) {
            propertyMap[pId].income += r.totalAmount;
        }
    });

    const ownerName = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || String(owner.phone || "Propriétaire");

    return {
      ownerName,
      year,
      totalIncome,
      totalMaintenance,
      totalUtilities,
      grossRevenue,
      netRevenue,
      estimatedTaxAirsi,
      finalResult,
      monthlyBreakdown,
      propertyBreakdown: Object.entries(propertyMap).map(([id, val]) => ({
        propertyId: id,
        propertyName: val.name,
        income: val.income
      }))
    };
    };
  }

  /**
   * [P2.5] Génère le Compte Rendu de Gestion (CRG) mensuel pour un mandat d'agence.
   */
  static async generateMonthlyCRG(leaseId: string, month: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { 
        property: { include: { mandates: { where: { status: "ACTIVE" } } } },
        mandatGestion: true
      }
    });

    if (!lease) throw new Error("Bail introuvable");

    const synthesis = await prisma.monthlyRentSynthesis.findUnique({
      where: { leaseId_month: { leaseId, month } }
    });

    if (!synthesis) throw new Error("Synthèse mensuelle introuvable");

    // 1. Revenus collectés
    const grossIncome = synthesis.amountCollected;

    // 2. Commission Agence (depuis le mandat ou mandatGestion)
    const mandate = lease.property.mandates[0] || lease.mandatGestion;
    let agencyCommission = 0;
    if (mandate) {
        const pct = (mandate as any).commissionPct || 10; // 10% par défaut
        agencyCommission = Math.round(grossIncome * (pct / 100));
    }

    // 3. Autres frais (Maintenance du mois)
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const maintenance = await prisma.ticketMaintenance.aggregate({
        where: {
            leaseId,
            statut: "CLOTURE",
            dateResolution: { gte: startDate, lte: endDate }
        },
        _sum: { coutFinal: true }
    });

    const maintenanceCost = maintenance._sum.coutFinal || 0;

    // 4. Calcul Net
    const netToOwner = grossIncome - agencyCommission - maintenanceCost;

    return {
        month,
        grossIncome,
        agencyCommission,
        maintenanceCost,
        netToOwner,
        currency: "FCFA"
    };
  }
}
