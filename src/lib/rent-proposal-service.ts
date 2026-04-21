import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { addDays } from "date-fns";

export class RentProposalService {
  /**
   * [P3.3] Create a new rent modification proposal.
   */
  static async createProposal(data: {
    leaseId: string;
    nouveauMontant: number;
    dateEffet: Date;
    raison?: string;
  }) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
    });

    if (!lease) throw new Error("Bail introuvable");

    const proposal = await prisma.propositionLoyer.create({
      data: {
        leaseId: data.leaseId,
        montantActuel: lease.rentAmount,
        nouveauMontant: data.nouveauMontant,
        dateEffet: data.dateEffet,
        raison: data.raison,
        statut: "EN_ATTENTE",
        dateNotification: new Date(),
      },
    });

    // Notify Tenant (WA + SMS as per rule MRL-01)
    await NotificationService.envoyerNotification(
      lease.tenantId || "",
      "PROPOSITION_LOYER",
      {
        payload: {
          proposalId: proposal.id,
          nouveauMontant: data.nouveauMontant,
          dateEffet: data.dateEffet.toLocaleDateString(),
          delai: "5 jours pour répondre",
        }
      }
    );

    return proposal;
  }

  /**
   * [P3.3] Tenant response (Accept or Refuse).
   */
  static async handleTenantResponse(proposalId: string, accept: boolean, commentaire?: string) {
    const proposal = await prisma.propositionLoyer.findUnique({
      where: { id: proposalId },
      include: { lease: true },
    });

    if (!proposal || proposal.statut !== "EN_ATTENTE") {
      throw new Error("Proposition introuvable ou déjà traitée.");
    }

    // 1. Create Consent record
    await prisma.consentementLoyer.create({
      data: {
        propositionId: proposalId,
        reponse: accept,
        commentaire,
      },
    });

    // 2. Update Proposal Status
    const newStatut = accept ? "ACCEPTE" : "REFUSE";
    await prisma.propositionLoyer.update({
      where: { id: proposalId },
      data: { statut: newStatut },
    });

    // 3. If accepted, update the Lease
    if (accept) {
       await prisma.lease.update({
         where: { id: proposal.leaseId },
         data: { rentAmount: proposal.nouveauMontant },
       });
    }

    // 4. Notify Landlord
    await NotificationService.envoyerNotification(
      proposal.lease.landlordId,
      "PROPOSITION_LOYER_REPONSE",
      {
        payload: {
          proposalId,
          reponse: accept ? "ACCEPTEE" : "REFUSEE",
          bienId: proposal.lease.propertyId,
        }
      }
    );

    return { success: true, statut: newStatut };
  }

  /**
   * [P3.3] Process expired proposals (Rule MRL-01: J+5 suspension).
   */
  static async processExpirations() {
    const fiveDaysAgo = addDays(new Date(), -5);

    const expiredProposals = await prisma.propositionLoyer.findMany({
      where: {
        statut: "EN_ATTENTE",
        createdAt: { lte: fiveDaysAgo },
      },
      include: { lease: true },
    });

    const results = [];

    for (const prop of expiredProposals) {
      await prisma.propositionLoyer.update({
        where: { id: prop.id },
        data: { statut: "EXPIRE" },
      });

      // Notify Landlord about the suspension
      await NotificationService.envoyerNotification(
        prop.lease.landlordId,
        "PROPOSITION_LOYER_EXPIREE",
        {
          payload: {
            proposalId: prop.id,
            motif: "Absence de réponse locataire après 5 jours.",
          }
        }
      );

      results.push(prop.id);
    }

    return results;
  }
}
