import { prisma } from "./prisma";
import { createAndNotifyReceipt } from "./receipt";

export class BulkReceiptService {
  /**
   * Génère les quittances manquantes pour tous les baux d'un propriétaire pour un mois donné.
   */
  static async generateMissingForOwner(ownerId: string, month: number, year: number) {
    const periodMonth = `${year}-${String(month).padStart(2, "0")}`;

    // 1. Trouver tous les baux actifs du propriétaire
    const activeLeases = await prisma.lease.findMany({
      where: {
        property: { ownerUserId: ownerId },
        status: { in: ["ACTIVE", "LOYER_IMPAYE", "MISE_EN_DEMEURE", "VALIDE"] }
      },
      include: {
        property: true,
        receipts: {
          where: { periodMonth }
        }
      }
    });

    const results = {
      total: activeLeases.length,
      alreadyGenerated: 0,
      generatedNow: 0,
      errors: 0
    };

    const toGenerate = activeLeases.filter(lease => lease.receipts.length === 0);
    results.alreadyGenerated = activeLeases.length - toGenerate.length;

    for (const lease of toGenerate) {
      try {
        await createAndNotifyReceipt({
          leaseId: lease.id,
          periodMonth,
          rentAmount: lease.rentAmount,
          chargesAmount: lease.chargesAmount || 0,
          paymentChannel: "BULK_SYSTEM",
          receiptType: "RENT",
          creatorName: "QAPRIL Bulk System"
        });
        results.generatedNow++;
      } catch (err) {
        console.error(`[BulkReceiptService] Erreur pour le bail ${lease.id}:`, err);
        results.errors++;
      }
    }

    return results;
  }

  /**
   * Récupère les statistiques de quittances pour un mois donné.
   */
  static async getBulkStats(ownerId: string, month: number, year: number) {
    const periodMonth = `${year}-${String(month).padStart(2, "0")}`;

    const leases = await prisma.lease.findMany({
      where: {
        property: { ownerUserId: ownerId },
        status: { in: ["ACTIVE", "LOYER_IMPAYE", "MISE_EN_DEMEURE", "VALIDE"] }
      },
      include: {
        receipts: {
          where: { periodMonth }
        }
      }
    });

    return {
      totalLeases: leases.length,
      missingCount: leases.filter(l => l.receipts.length === 0).length
    };
  }
}
