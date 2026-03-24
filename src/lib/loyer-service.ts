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
}
