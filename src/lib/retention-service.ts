import { prisma } from "./prisma";
import { addDays } from "date-fns";

export interface ChurnRisk {
  leaseId: string;
  tenantName: string;
  daysUntilExpiration: number;
  riskFactor: "FIN_DE_BAIL" | "SATISFACTION_BASSE" | "LITIGE_EN_COURS";
  probability: number; // 0-100
  retentionAction: string;
}

export class RetentionService {
  /**
   * [P4.5] Identify tenants likely to leave the platform.
   * Focuses on upcoming expirations and friction points.
   */
  static async getChurnRisks(limit: number = 5): Promise<ChurnRisk[]> {
    const ninetyDaysFromNow = addDays(new Date(), 90);

    // 1. Find leases expiring soon
    const expiringSoon = await prisma.lease.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: ninetyDaysFromNow, not: null }
      },
      include: {
        tenant: true,
        reclamations: { where: { statut: "OUVERT" } },
        property: true
      },
      take: 20
    });

    const risks: ChurnRisk[] = [];

    for (const lease of expiringSoon) {
      let probability = 30; // Base probability for expiration
      let riskFactor: ChurnRisk["riskFactor"] = "FIN_DE_BAIL";

      // Increment probability based on friction
      if (lease.reclamations.length > 0) {
        probability += 40;
        riskFactor = "LITIGE_EN_COURS";
      }

      // Check for signalements (complaints about the property)
      const signalements = await prisma.signalementLocataire.count({
        where: { bailId: lease.id }
      });
      if (signalements > 0) {
        probability += 20;
        riskFactor = "SATISFACTION_BASSE";
      }

      const daysUntilExpiration = lease.endDate 
        ? Math.ceil((lease.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      risks.push({
        leaseId: lease.id,
        tenantName: `${lease.tenant?.firstName || ""} ${lease.tenant?.lastName || ""}`.trim(),
        daysUntilExpiration,
        riskFactor,
        probability: Math.min(100, probability),
        retentionAction: this.getRetentionAction(riskFactor, lease.id)
      });
    }

    return risks
      .sort((a, b) => b.probability - a.probability)
      .slice(0, limit);
  }

  private static getRetentionAction(factor: ChurnRisk["riskFactor"], leaseId: string): string {
    switch (factor) {
      case "LITIGE_EN_COURS":
        return "Accélérer la résolution du ticket de réclamation en cours.";
      case "SATISFACTION_BASSE":
        return "Proposer une remise commerciale 'Geste de fidélité' sur le prochain loyer.";
      case "FIN_DE_BAIL":
        return "Initier le renouvellement du bail avec une mise à jour des conditions.";
      default:
        return "Proposer une enquête de satisfaction.";
    }
  }
}
