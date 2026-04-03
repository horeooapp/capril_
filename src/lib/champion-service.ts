import { prisma } from "@/lib/prisma";
import { CommType, ProspectStatut } from "@prisma/client";

/**
 * CHAMPION SERVICE - M-CHAMPION (ADD-15)
 * Performance tracking and commission management for QAPRIL Champions.
 */
export class ChampionService {
  /**
   * Add a new prospect to a champion's pipeline.
   */
  static async addProspect(championId: string, data: {
    nom: string;
    telephone: string;
    quartier?: string;
    nbLogements?: string;
  }) {
    return await prisma.championProspect.create({
      data: {
        championId,
        nom: data.nom,
        telephone: data.telephone,
        quartier: data.quartier,
        nbLogementsEstime: data.nbLogements,
        statut: ProspectStatut.A_RAPPELER,
      },
    });
  }

  /**
   * Convert a prospect to an active user and award commission.
   */
  static async convertProspect(prospectId: string, registeredUserId: string) {
    const prospect = await prisma.championProspect.findUnique({
      where: { id: prospectId },
      include: { champion: true },
    });

    if (!prospect) throw new Error("Prospect not found");

    // 1. Update prospect status
    await prisma.championProspect.update({
      where: { id: prospectId },
      data: {
        statut: ProspectStatut.INSCRIT,
        userIdInscrit: registeredUserId,
        dateDernierContact: new Date(),
      },
    });

    // 2. Award Recruitment Commission (Logic as per business rules)
    // Example: 5000 FCFA for a new verified owner recruitment
    const commissionAmount = 5000; 

    return await this.addCommission(prospect.championId, CommType.RECRUTEMENT, registeredUserId, commissionAmount);
  }

  /**
   * Record a new commission.
   */
  static async addCommission(championId: string, type: CommType, referenceId: string, amount: number) {
    const commission = await prisma.championCommission.create({
      data: {
        championId,
        typeAction: type,
        referenceId,
        montantFcfa: amount,
        statut: "EN_ATTENTE",
      },
    });

    // Update champion total profile
    await prisma.championProfile.update({
      where: { id: championId },
      data: {
        totalCommissionsFcfa: { increment: amount },
        totalInscriptions: type === "RECRUTEMENT" ? { increment: 1 } : undefined,
      },
    });

    return commission;
  }

  /**
   * Get champion performance dashboard data.
   */
  static async getPerformance(userId: string) {
    const profile = await prisma.championProfile.findUnique({
      where: { userId },
      include: {
        prospects: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!profile) return null;

    return {
      stats: {
        totalInscriptions: profile.totalInscriptions,
        totalCommissions: profile.totalCommissionsFcfa,
        objectif: profile.objectifMensuel,
        progression: Math.round((profile.totalInscriptions / (profile.objectifMensuel || 1)) * 100)
      },
      recentProspects: profile.prospects,
      recentCommissions: profile.commissions
    };
  }

  /**
   * Get list of unpaid rents (arrears) for a champion's zone or general.
   * ADD-06 v2: Recovery focus.
   */
  static async getRecoveryList(userId: string) {
    // For now, Champions see all unpaid Direct Management leases.
    // In production, we would filter by zone.
    const arrears = await prisma.leaseArrear.findMany({
      where: {
        status: "unpaid",
        lease: {
           typeGestion: { notIn: ["agreee", "mandat"] }, // Focus on Direct Management
           status: "ACTIVE"
        }
      },
      include: {
        lease: {
          include: {
             tenant: { select: { firstName: true, lastName: true, phone: true } },
             property: { select: { address: true, propertyCode: true } },
             landlord: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { dueDate: "asc" }
    });

    return arrears;
  }

  /**
   * Scan for pending receipts and generate LeaseArrear entries.
   * This populates the pipeline for Champions.
   */
  static async discoverArrears() {
    // Find all receipts that are not paid and are older than today
    const pendingReceipts = await prisma.receipt.findMany({
      where: {
        status: "pending",
        declarative: false, // Only formal receipts
      },
      include: {
        lease: true
      }
    });

    let count = 0;
    for (const receipt of pendingReceipts) {
      // Check if an arrear already exists for this lease and period
      // We use the 1st of the periodMonth as a reference for dueDate
      const [year, month] = receipt.periodMonth.split('-').map(Number);
      const dueDate = new Date(year, month - 1, 5); // 5th of the month

      const existing = await prisma.leaseArrear.findFirst({
        where: {
          leaseId: receipt.leaseId,
          dueDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month - 1, 28)
          }
        }
      });

      if (!existing) {
        await prisma.leaseArrear.create({
          data: {
            leaseId: receipt.leaseId,
            amount: receipt.totalAmount,
            dueDate: dueDate,
            status: "unpaid"
          }
        });
        count++;
      }
    }

    return { discovered: pendingReceipts.length, created: count };
  }

  /**
   * Send a personalized relance from the Champion.
   */
  static async triggerChampionRelance(arrearId: string, championId: string, canal: "sms" | "wa" = "wa") {
    const arrear = await prisma.leaseArrear.findUnique({
      where: { id: arrearId },
      include: {
        lease: {
          include: {
            tenant: true,
            landlord: true
          }
        }
      }
    });

    if (!arrear) throw new Error("Arréage introuvable");

    const champion = await prisma.user.findUnique({ where: { id: championId } });
    if (!champion) throw new Error("Champion introuvable");

    const event = "CHAMPION_RELANCE" as any;
    const amount = arrear.amount;
    const tenantName = (arrear.lease.tenant?.firstName ? arrear.lease.tenant.firstName + " " : "") + (arrear.lease.tenant?.lastName || "") || "Client";
    
    // Generate a payment link (mock for now, but following the pattern)
    const paymentUrl = `https://qapril.ci/pay/${arrear.id}`;

    const payload = {
      smsText: `QAPRIL: Bonjour ${tenantName}, je suis ${(champion.firstName ? champion.firstName + " " : "") + (champion.lastName || "") || 'votre agent'}, votre Champion QAPRIL. Votre loyer de ${amount.toLocaleString()} FCFA est en attente. Réglez-le ici : ${paymentUrl}. Merci !`,
      parameters: [tenantName, (champion.firstName ? champion.firstName + " " : "") + (champion.lastName || "") || "Champion", String(amount), paymentUrl]
    };

    const { NotificationService } = await import("./notification-service");
    if (!arrear.lease.tenantId) throw new Error("Locataire introuvable");
    await NotificationService.envoyerNotification(arrear.lease.tenantId, event, {
      referenceId: arrear.id,
      payload
    });

    // Log the action in Audit
    await prisma.auditLog.create({
      data: {
        userId: championId,
        action: "CHAMPION_RELANCE_SENT",
        module: "CHAMPION",
        entityId: arrearId,
        newValues: { canal, tenantId: arrear.lease.tenantId, paymentUrl }
      }
    });

    return { success: true, paymentUrl };
  }
}
