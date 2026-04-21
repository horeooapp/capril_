import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { differenceInDays } from "date-fns";

export interface RiskAnalysis {
  tenantId: string;
  riskLevel: "BAS" | "MODERE" | "ELEVE" | "CRITIQUE";
  score: number; // 0-100 (100 = max risk)
  driftDays: number; // Average drift in payment date
  unpaidCount: number;
  recommendation: string;
}

export class RiskAnalysisService {
  /**
   * [P4.2] Predict arrears risk for a tenant based on payment history.
   * Algorithm: Analyze the "drift" (delay) trend over the last 6 months.
   */
  static async analyzeTenantRisk(tenantId: string): Promise<RiskAnalysis> {
    const receipts = await prisma.receipt.findMany({
      where: {
        lease: { tenantId },
        status: "paid",
        paidAt: { not: null }
      },
      orderBy: { periodMonth: 'desc' },
      take: 6
    });

    if (receipts.length < 3) {
      return {
        tenantId,
        riskLevel: "BAS",
        score: 10,
        driftDays: 0,
        unpaidCount: 0,
        recommendation: "Données insuffisantes pour une analyse prédictive."
      };
    }

    // Calculate delay for each month (assuming due date is day 5)
    const delays = receipts.map(r => {
      const [year, month] = r.periodMonth.split('-').map(Number);
      const dueDate = new Date(year, month - 1, 5);
      return differenceInDays(new Date(r.paidAt!), dueDate);
    });

    // Calculate drift (is it getting worse?)
    // If the average delay of the last 3 is > average of the previous 3
    const recentAvg = (delays[0] + delays[1] + delays[2]) / 3;
    const previousAvg = (delays[3] + delays[4] + delays[5]) / 3 || recentAvg;

    const drift = recentAvg - previousAvg;
    const unpaidCount = await prisma.receipt.count({
      where: { lease: { tenantId }, status: "pending" }
    });

    let riskScore = (recentAvg * 5) + (drift * 10) + (unpaidCount * 25);
    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel: "BAS" | "MODERE" | "ELEVE" | "CRITIQUE" = "BAS";
    if (riskScore > 80 || unpaidCount > 1) riskLevel = "CRITIQUE";
    else if (riskScore > 50) riskLevel = "ELEVE";
    else if (riskScore > 30) riskLevel = "MODERE";

    const recommendations = {
      BAS: "Profil stable. Aucune action requise.",
      MODERE: "Légère dérive observée. Envisager un rappel préventif à J-2.",
      ELEVE: "Risque d'impayé imminent. Proposer un étalement ou un prélèvement automatique.",
      CRITIQUE: "Alerte critique. Mise en demeure préventive recommandée."
    };

    return {
      tenantId,
      riskLevel,
      score: Math.round(riskScore),
      driftDays: Math.round(drift),
      unpaidCount,
      recommendation: recommendations[riskLevel]
    };
  }

  /**
   * [P4.2] Batch risk analysis for all active tenants.
   * To be used for agency dashboards or early warnings.
   */
  static async getHighRiskTenants(limit: number = 10) {
    const activeLeases = await prisma.lease.findMany({
        where: { status: 'ACTIVE' },
        select: { tenantId: true }
    });

    const uniqueTenants = Array.from(new Set(activeLeases.map(l => l.tenantId).filter((id): id is string => !!id)));
    
    const results = await Promise.all(
        uniqueTenants.map(id => this.analyzeTenantRisk(id))
    );

    return results
      .filter(r => r.riskLevel === "ELEVE" || r.riskLevel === "CRITIQUE")
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
