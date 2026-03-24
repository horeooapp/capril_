import { prisma } from "@/lib/prisma";
import { generateMonthlyReportPDF } from "./pdf-reports";
import { NotificationService } from "./notification-service";

/**
 * RAPPORT SERVICE - M-RAPPORT (ADD-15)
 * Monthly PDF Reporting for Owners.
 */
export class RapportService {
  /**
   * Generates and sends monthly reports to all owners.
   */
  static async processAllMonthlyReports(month: number, year: number) {
    const period = `${year}-${String(month).padStart(2, "0")}`;

    // 1. Fetch all owners with active properties
    const owners = await (prisma as any).user.findMany({
      where: { role: { in: ["LANDLORD", "LANDLORD_PRO"] } },
      include: {
        propertiesOwned: {
          include: {
            leases: {
              where: { status: "ACTIVE" },
              include: { pgwPayments: {
                where: {
                  statut: "CONFIRMEE",
                }
              }}
            }
          }
        }
      }
    });

    for (const owner of owners) {
      if (!owner.propertiesOwned || owner.propertiesOwned.length === 0) continue;

      try {
        const reportData = this.aggregateOwnerMetrics(owner, period);
        const pdfBuffer = await generateMonthlyReportPDF(reportData);

        // 2. Send via multi-canal
        await NotificationService.envoyerNotification(owner.id, "RAPPORT_MENSUEL", {
          receiptBuffer: pdfBuffer,
          payload: { month, year }
        });

      } catch (err) {
        console.error(`[RapportService] Error for owner ${owner.id}:`, err);
      }
    }
  }

  private static aggregateOwnerMetrics(owner: any, period: string) {
    let totalPotentiel = 0;
    let totalEncaisse = 0;
    let nbLeases = 0;
    let nbImpayes = 0;
    const details: any[] = [];

    for (const property of owner.propertiesOwned) {
      for (const lease of property.leases) {
        nbLeases++;
        totalPotentiel += Number(lease.rentAmount);
        
        const paidThisMonth = lease.pgwPayments.length > 0;
        if (paidThisMonth) {
          totalEncaisse += Number(lease.pgwPayments[0].montant); // Simplification
        } else {
          nbImpayes++;
        }

        details.push({
          address: property.address || property.propertyCode,
          status: paidThisMonth ? "paid" : "unpaid",
          amount: Number(lease.rentAmount)
        });
      }
    }

    const tauxRecouvrement = totalPotentiel > 0 ? Math.round((totalEncaisse / totalPotentiel) * 100) : 100;

    return {
      ownerName: owner.fullName || owner.phone,
      period,
      metrics: {
        totalPotentiel,
        totalEncaisse,
        tauxRecouvrement,
        nbLeases,
        nbImpayes
      },
      details
    };
  }
}
