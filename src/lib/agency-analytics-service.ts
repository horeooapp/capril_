import { prisma } from "./prisma";

export interface AgencyKPIs {
  tauxOccupation: number;
  tauxRecouvrementMois: number;
  tauxRecouvrementAnnuel: number;
  unpaidTotal: number;
  totalUnits: number;
  occupiedUnits: number;
  collectionTrend: number[]; // TR of last 6 months
}

export class AgencyAnalyticsService {
  /**
   * [P4.3] Calculate core KPIs for an agency portfolio.
   */
  static async getAgencyKPIs(agencyId: string): Promise<AgencyKPIs> {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // 1. Taux d'Occupation (TO)
    const properties = await prisma.property.findMany({
      where: { mandates: { some: { agentUserId: agencyId, status: "ACTIVE" } } },
      include: { leases: { where: { status: "ACTIVE" } } }
    }) as any[];

    const totalUnits = properties.length;
    const occupiedUnits = properties.filter(p => p.leases && p.leases.length > 0).length;
    const tauxOccupation = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // 2. Taux de Recouvrement (TR) - Mois en cours
    const synthesis = await prisma.monthlyRentSynthesis.findMany({
      where: { 
        month: currentMonth,
        lease: { property: { mandates: { some: { agentUserId: agencyId, status: "ACTIVE" } } } }
      }
    });

    const totalDue = synthesis.reduce((sum, s) => sum + s.totalExpected, 0);
    const totalCollected = synthesis.reduce((sum, s) => sum + s.amountCollected, 0);
    const tauxRecouvrementMois = totalDue > 0 ? (totalCollected / totalDue) * 100 : 100;

    // 3. Unpaid Total (All active leases)
    const unpaidAggr = await prisma.monthlyRentSynthesis.findMany({
        where: {
            lease: { property: { mandates: { some: { agentUserId: agencyId, status: "ACTIVE" } } } },
            status: { not: "PAIE" } 
        }
    });

    const unpaidTotal = unpaidAggr.reduce((sum, s) => sum + (s.totalExpected - s.amountCollected), 0);

    // 4. Trend (Last 6 months)
    const collectionTrend = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        const synths = await prisma.monthlyRentSynthesis.findMany({
            where: { 
              month: m,
              lease: { property: { mandates: { some: { agentUserId: agencyId, status: "ACTIVE" } } } }
            }
        });
        
        const due = synths.reduce((sum, s) => sum + s.totalExpected, 0);
        const coll = synths.reduce((sum, s) => sum + s.amountCollected, 0);
        collectionTrend.push(due > 0 ? Math.round((coll / due) * 100) : 100);
    }

    return {
      tauxOccupation: Math.round(tauxOccupation),
      tauxRecouvrementMois: Math.round(tauxRecouvrementMois),
      tauxRecouvrementAnnuel: Math.round(collectionTrend.reduce((a, b) => a + b, 0) / 6),
      unpaidTotal,
      totalUnits,
      occupiedUnits,
      collectionTrend
    };
  }
}
