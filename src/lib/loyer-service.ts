import { prisma } from "@/lib/prisma";

/**
 * LOYER SERVICE - ADD-16
 * Handles rent modification propositions and tenant consent.
 * Enforces the rule that rent cannot be modified without consent or court order.
 */
export class LoyerService {
  /**
   * Propose a rent modification to a tenant.
   */
  static async proposeModification(data: {
    leaseId: string;
    nouveauMontant: number;
    dateEffet: Date;
    raison?: string;
  }) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
    });

    if (!lease) throw new Error("Lease not found");

    return await prisma.propositionLoyer.create({
      data: {
        leaseId: data.leaseId,
        montantActuel: lease.rentAmount,
        nouveauMontant: data.nouveauMontant,
        dateEffet: data.dateEffet,
        raison: data.raison,
        statut: "EN_ATTENTE",
      },
    });
  }

  /**
   * Record tenant consent or refusal.
   */
  static async treatProposition(propositionId: string, reponse: boolean, commentaire?: string, metadata?: { ip?: string, ua?: string }) {
    const proposition = await prisma.propositionLoyer.findUnique({
      where: { id: propositionId },
    });

    if (!proposition || proposition.statut !== "EN_ATTENTE") {
      throw new Error("Proposition not found or already treated");
    }

    // 1. Create Consent record
    const consent = await prisma.consentementLoyer.create({
      data: {
        propositionId,
        reponse,
        commentaire,
        ipAddress: metadata?.ip,
        userAgent: metadata?.ua,
      },
    });

    // 2. Update Proposition status
    const status = reponse ? "ACCEPTE" : "REFUSE";
    await prisma.propositionLoyer.update({
      where: { id: propositionId },
      data: { statut: status },
    });

    // 3. If accepted, update the Lease rent amount (or schedule it)
    if (reponse) {
      // In a real scenario, we might want to schedule this for the dateEffet
      // For now, we update the lease if dateEffet is now or past
      const now = new Date();
      if (proposition.dateEffet <= now) {
        await prisma.lease.update({
          where: { id: proposition.leaseId },
          data: { rentAmount: proposition.nouveauMontant },
        });
      }
    }

    return { proposition: status, consent };
  }

  /**
   * MRL-01: Auto-suspend propositions after 5 days (120h) without response.
   */
  static async autoSuspendPropositions() {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const expiredPropositions = await prisma.propositionLoyer.updateMany({
      where: {
        statut: "EN_ATTENTE",
        createdAt: { lt: fiveDaysAgo },
      },
      data: {
        statut: "EXPIRE",
      },
    });

    console.log(`[MRL-01] Suspended ${expiredPropositions.count} expired rent propositions.`);
    return expiredPropositions.count;
  }

  /**
   * Part 1.1: Initialize the first monthly rent synthesis for a new lease.
   */
  static async initLeaseSynthesis(leaseId: string) {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) throw new Error("Lease not found");

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    return await prisma.monthlyRentSynthesis.upsert({
      where: {
        leaseId_month: {
          leaseId,
          month: monthKey,
        },
      },
      update: {},
      create: {
        leaseId,
        month: monthKey,
        totalExpected: lease.rentAmount + (lease.chargesAmount || 0),
        status: "EN_ATTENTE",
      },
    });
    });
  }

  /**
   * Part 2.4: Get payment breakdown for colocation.
   */
  static async getColocationBreakdown(leaseId: string, month: string) {
    const colocs = await prisma.colocataire.findMany({
      where: { leaseId, status: "ACTIF" },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } }
    });

    const payments = await prisma.paymentPgw.findMany({
      where: {
        leaseId,
        moisConcerne: new Date(month + "-01"), // Approximate conversion
        statut: "CONFIRMEE"
      }
    });

    return colocs.map(coloc => {
      const colocPayments = payments.filter(p => p.payeurId === coloc.userId);
      const paid = colocPayments.reduce((sum, p) => sum + p.montant, 0);
      return {
        userId: coloc.userId,
        name: `${coloc.user.firstName} ${coloc.user.lastName}`,
        expected: coloc.partLoyer || 0,
        paid,
        isFullyPaid: paid >= (coloc.partLoyer || 0)
      };
    });
  }
}
