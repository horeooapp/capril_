import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

/**
 * LOYER SERVICE - ADD-16 & Principe des Deux Horloges (Reprise de bail antérieur)
 * Handles rent modification propositions and tenant consent.
 * Enforces the rule that rent cannot be modified without consent or court order,
 * and calculates legal revision intervals from the Contractual Clock (derniereRevisionAt / startDate).
 */
export class LoyerService {
  /**
   * Propose a rent modification to a tenant.
   * Respects the Contractual Clock (openingState.derniereRevisionAt -> LeaseRentHistory -> lease.startDate)
   * and the contractual notice period (lease.preavisRequisMois).
   */
  static async proposeModification(data: {
    leaseId: string;
    nouveauMontant: number;
    dateEffet: Date;
    raison?: string;
  }) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
      include: {
        openingState: true,
        historiqueLoyers: {
          orderBy: { effectiveLe: "desc" },
          take: 1,
        },
      },
    });

    if (!lease) throw new Error("Lease not found");

    const now = new Date();
    const dateEffet = new Date(data.dateEffet);

    // Horloge contractuelle : dernière révision réelle (état d'ouverture ou historique) ou date d'entrée initiale (startDate)
    const dateReferenceRevision =
      lease.openingState?.derniereRevisionAt ||
      lease.historiqueLoyers[0]?.effectiveLe ||
      lease.startDate;

    const diffMsRevision = dateEffet.getTime() - new Date(dateReferenceRevision).getTime();
    const diffYears = diffMsRevision / (1000 * 60 * 60 * 24 * 365.25);
    const estConformeDelaiAns = diffYears >= 3; // Art. 422 CCH : révision triennale (3 ans)

    // Préavis contractuel : lecture depuis le contrat (preavisRequisMois) sans imposer 3 mois si le bail antérieur stipule autrement
    const preavisMois = lease.preavisRequisMois ?? 3;
    const minDateEffetPreavis = new Date(now);
    minDateEffetPreavis.setMonth(minDateEffetPreavis.getMonth() + preavisMois);
    const estConformePreavis = dateEffet.getTime() >= minDateEffetPreavis.getTime();

    const motifsNonConformite: string[] = [];
    if (!estConformeDelaiAns) {
      motifsNonConformite.push(
        `Délai légal de 3 ans non atteint depuis la dernière référence contractuelle (${new Date(dateReferenceRevision).toLocaleDateString("fr-FR")}).`
      );
    }
    if (!estConformePreavis) {
      motifsNonConformite.push(
        `Préavis contractuel de ${preavisMois} mois non respecté pour une prise d'effet au ${dateEffet.toLocaleDateString("fr-FR")}.`
      );
    }

    return await prisma.propositionLoyer.create({
      data: {
        leaseId: data.leaseId,
        montantActuel: lease.rentAmount,
        nouveauMontant: data.nouveauMontant,
        dateEffet,
        dateEffetDemandee: dateEffet,
        dateNotification: now,
        estConformeDelaiAns,
        estConformePreavis,
        motifNullite: motifsNonConformite.length > 0 ? motifsNonConformite.join(" ") : null,
        raison: data.raison,
        statut: "EN_ATTENTE",
      },
    });
  }

  /**
   * Record tenant consent or refusal.
   */
  static async treatProposition(
    propositionId: string,
    reponse: boolean,
    commentaire?: string,
    metadata?: { ip?: string; ua?: string }
  ) {
    const proposition = await prisma.propositionLoyer.findUnique({
      where: { id: propositionId },
      include: { lease: true },
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

    // 3. If accepted, record in generalized LeaseRentHistory and update Lease rentAmount if effective
    if (reponse) {
      const hashModif = createHash("sha256")
        .update(
          JSON.stringify({
            leaseId: proposition.leaseId,
            propositionId,
            ancienLoyer: proposition.montantActuel,
            nouveauLoyer: proposition.nouveauMontant,
            effectiveLe: proposition.dateEffet.toISOString(),
          })
        )
        .digest("hex");

      await prisma.leaseRentHistory.create({
        data: {
          leaseId: proposition.leaseId,
          ancienLoyer: proposition.montantActuel,
          nouveauLoyer: proposition.nouveauMontant,
          anciennesCharges: proposition.lease.chargesAmount || 0,
          nouvellesCharges: proposition.lease.chargesAmount || 0,
          motif: proposition.raison || "Révision de loyer acceptée contradictoirement",
          sourceModification: "REVISION_CONSENTIE_QAPRIL",
          confirmationLocataire: true,
          effectiveLe: proposition.dateEffet,
          hashModification: hashModif,
        },
      });

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

    const refDate = lease.dateReprise ? new Date(lease.dateReprise) : new Date();
    const monthKey = `${refDate.getFullYear()}-${(refDate.getMonth() + 1).toString().padStart(2, "0")}`;

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
  }

  /**
   * Part 2.4: Get payment breakdown for colocation.
   */
  static async getColocationBreakdown(leaseId: string, month: string) {
    const colocs = await prisma.colocataire.findMany({
      where: { leaseId, status: "ACTIF" },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    });

    const payments = await prisma.paymentPgw.findMany({
      where: {
        leaseId,
        moisConcerne: new Date(month + "-01"), // Approximate conversion
        statut: "CONFIRMEE",
      },
    });

    return colocs.map((coloc) => {
      const colocPayments = payments.filter((p) => p.payeurId === coloc.userId);
      const paid = colocPayments.reduce((sum, p) => sum + Number(p.montant), 0);
      return {
        userId: coloc.userId,
        name: `${coloc.user.firstName} ${coloc.user.lastName}`,
        expected: coloc.partLoyer || 0,
        paid,
        isFullyPaid: paid >= (coloc.partLoyer || 0),
      };
    });
  }
}
