"use server";

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { LeaseStatus, Role, TypeBail, CautionDestEnum } from "@prisma/client";
import { ensureAuthenticated, ensurePropertyAccess, ensureLeaseAccess } from "./auth-helpers";
import { generateLeaseRef } from "@/lib/lease";
import { normalizePhone } from "@/lib/phone";
import { sendSMS } from "@/lib/sms";
import { sendOpenWAMessage } from "@/lib/openwa";

function computeSha256(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/**
 * Calcule la prochaine échéance anniversaire contractuelle pour un bail antérieur
 * et détermine s'il est en reconduction tacite.
 */
function computeContractualClock(startDate: Date, durationMonths: number, explicitEndDate?: Date | null, now = new Date()) {
  const safeDuration = durationMonths > 0 ? durationMonths : 12;
  const initialEnd = explicitEndDate
    ? new Date(explicitEndDate)
    : new Date(startDate.getFullYear(), startDate.getMonth() + safeDuration, startDate.getDate());

  const enReconductionTacite = initialEnd.getTime() < now.getTime();
  const prochaineEcheance = new Date(initialEnd);

  if (enReconductionTacite) {
    while (prochaineEcheance.getTime() <= now.getTime()) {
      prochaineEcheance.setMonth(prochaineEcheance.getMonth() + safeDuration);
    }
  }

  return {
    initialEndDate: initialEnd,
    enReconductionTacite,
    prochaineEcheanceContractuelle: prochaineEcheance,
  };
}

/**
 * Détecte sans bloquer les clauses antérieures dérogeant au CCH 2019 (Art. 415, 416, 440, 442)
 */
function detectClausesDerogatoires(params: {
  startDate: Date;
  loyerEnVigueur: number;
  depositAmount?: number;
  avanceLoyer?: number;
  preavisRequisMois?: number;
}) {
  const anomalies: Array<{ code: string; article: string; detail: string }> = [];
  const cchEntryDate = new Date("2019-06-26T00:00:00Z");
  const anterieurCch2019 = params.startDate.getTime() < cchEntryDate.getTime();

  const maxLegal = params.loyerEnVigueur * 2;
  if ((params.depositAmount || 0) > maxLegal) {
    anomalies.push({
      code: "CAUTION_SUPERIEURE_2_MOIS",
      article: "Art. 416 CCH (Loi n°2019-576)",
      detail: `Caution d'origine (${params.depositAmount} FCFA) supérieure au plafond actuel de 2 mois (${maxLegal} FCFA). Clause antérieure signalée, non réécrite.`,
    });
  }
  if ((params.avanceLoyer || 0) > maxLegal) {
    anomalies.push({
      code: "AVANCE_SUPERIEURE_2_MOIS",
      article: "Art. 415 CCH (Loi n°2019-576)",
      detail: `Avance de loyer d'origine (${params.avanceLoyer} FCFA) supérieure au plafond actuel de 2 mois (${maxLegal} FCFA). Clause antérieure signalée, non réécrite.`,
    });
  }
  if (params.preavisRequisMois !== undefined && params.preavisRequisMois < 3) {
    anomalies.push({
      code: "PREAVIS_CONTRACTUEL_SPECIFIQUE",
      article: "Arts. 440 & 442 CCH",
      detail: `Durée de préavis contractuelle (${params.preavisRequisMois} mois) inférieure au standard de 3 mois. Primauté donnée au contrat d'origine.`,
    });
  }

  return {
    anterieurCch2019,
    nbClausesDerogatoires: anomalies.length,
    anomalies,
  };
}

export interface RepriseBailAnterieurInput {
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  leaseType?: "residential" | "commercial";
  qualificationBail: "ECRIT_ENREGISTRE" | "ECRIT_NON_ENREGISTRE" | "VERBAL";
  // Horloge contractuelle (Figée sur le contrat d'origine)
  startDate: Date | string;
  endDate?: Date | string | null;
  durationMonths?: number;
  loyerInitial?: number;
  loyerEnVigueur: number;
  chargesEnVigueur?: number;
  paymentDay?: number;
  preavisRequisMois?: number;
  derniereRevisionAt?: Date | string | null;
  loiApplicable?: string;
  // Horloge de gestion QAPRIL
  dateReprise?: Date | string;
  dernierMoisPaye?: string; // Format YYYY-MM
  soldeOuverture?: number; // Positif = arriéré d'ouverture déclaré (soumis à confirmation contradictoire)
  // Preuves et pièces d'origine
  scanFichierUrl?: string;
  scanFichierSha256?: string;
  dgiReference?: string;
  sourceMigrationId?: string;
  sourcePreuves?: Record<string, any>;
  // Caution historique (date réelle, sans consignation CDC rétroactive imposée)
  depositAmount?: number;
  dateVersementCaution?: Date | string;
  avanceLoyer?: number;
  // Historique de loyers (avenants passés) et quittances antérieures
  avenantsPasses?: Array<{
    ancienLoyer: number;
    nouveauLoyer: number;
    effectiveLe: Date | string;
    motif?: string;
  }>;
  quittancesPassees?: Array<{
    periodMonth: string; // YYYY-MM
    rentAmount: number;
    chargesAmount?: number;
    paidAt?: Date | string;
    paymentMethod?: string;
    preuveUrl?: string;
  }>;
  mandatGestionId?: string;
}

/**
 * [REP-01] Reprendre un bail antérieur en cours d'exécution selon le principe des Deux Horloges
 * - Horloge contractuelle : startDate, durationMonths, preavisRequisMois, derniereRevisionAt, enReconductionTacite
 * - Horloge de gestion : dateReprise, LeaseOpeningState contradictoire, neutralité du score et des frais passés
 */
export async function reprendreBailAnterieur(input: RepriseBailAnterieurInput) {
  try {
    const session = await ensureAuthenticated();
    await ensurePropertyAccess(input.propertyId);

    const property = await prisma.property.findUnique({
      where: { id: input.propertyId },
    });
    if (!property) {
      return { success: false, error: "Bien immobilier introuvable." };
    }

    const startDate = new Date(input.startDate);
    if (isNaN(startDate.getTime())) {
      return { success: false, error: "La date de début du contrat d'origine (startDate) est invalide." };
    }

    const now = new Date();
    // Par défaut, la date de reprise est fixée au 1er du mois courant ou à la date fournie
    const dateReprise = input.dateReprise
      ? new Date(input.dateReprise)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const durationMonths = input.durationMonths || 12;
    const explicitEndDate = input.endDate ? new Date(input.endDate) : null;

    // 1. Calcul de l'horloge contractuelle et de la reconduction tacite
    const contractualClock = computeContractualClock(startDate, durationMonths, explicitEndDate, now);

    // 2. Régime juridique applicable & clauses dérogatoires (signalées sans jamais bloquer)
    const cchDate = new Date("2019-06-26T00:00:00Z");
    const defaultLoi =
      input.leaseType === "commercial"
        ? "Acte Uniforme OHADA (Bail à usage professionnel)"
        : startDate < cchDate
        ? "Régime antérieur CCH + Dispositions d'ordre public Loi n°2019-576"
        : "Loi n°2019-576 du 26 juin 2019 (CCH)";

    const clausesDerogatoires = detectClausesDerogatoires({
      startDate,
      loyerEnVigueur: input.loyerEnVigueur,
      depositAmount: input.depositAmount,
      avanceLoyer: input.avanceLoyer,
      preavisRequisMois: input.preavisRequisMois,
    });

    // 3. Résolution ou création du locataire (sans activer scoreConsent par défaut : RGPD / consentement explicite)
    const normalizedPhone = normalizePhone(input.tenantPhone);
    let tenant = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!tenant) {
      const parts = (input.tenantName || "Locataire").trim().split(/\s+/);
      tenant = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          email: input.tenantEmail || null,
          firstName: parts[0] || "Locataire",
          lastName: parts.slice(1).join(" ") || "",
          role: Role.TENANT,
          status: "PENDING",
        },
      });
    }

    const ownerId = property.ownerUserId;
    const agentId = session.user.id !== ownerId ? session.user.id : null;
    const leaseRef = await generateLeaseRef(input.leaseType || "residential");

    const scanHash =
      input.scanFichierSha256 ||
      (input.scanFichierUrl ? computeSha256({ url: input.scanFichierUrl, leaseRef }) : null);

    // Statut DGI : ne jamais pénaliser rétroactivement le locataire ni déclencher d'alerte 30j post-import erronée
    const statutDgi =
      input.qualificationBail === "ECRIT_ENREGISTRE"
        ? "ENREGISTRE_ANTERIEUREMENT"
        : input.qualificationBail === "ECRIT_NON_ENREGISTRE"
        ? "A_REGULARISER_SANS_PENALITE"
        : "NON_APPLICABLE_VERBAL";

    const typeBail =
      input.qualificationBail === "VERBAL" ? TypeBail.DECLARATIF_BDQ : TypeBail.ECRIT;

    const derniereRevisionAt = input.derniereRevisionAt ? new Date(input.derniereRevisionAt) : null;

    // 4. Transaction atomique : Lease + LeaseOpeningState + LeaseRentHistory + CautionBail + Quittances passées
    const result = await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.create({
        data: {
          leaseReference: leaseRef,
          propertyId: input.propertyId,
          landlordId: ownerId,
          agentId,
          tenantId: tenant.id,
          mandatGestionId: input.mandatGestionId || null,
          sourceMigrationId: input.sourceMigrationId || null,
          leaseType: input.leaseType || "residential",
          typeBail,
          // Horloge contractuelle
          startDate,
          endDate: contractualClock.initialEndDate,
          durationMonths,
          enReconductionTacite: contractualClock.enReconductionTacite,
          prochaineEcheanceContractuelle: contractualClock.prochaineEcheanceContractuelle,
          // Préavis du contrat d'origine respecté
          preavisRequisMois: input.preavisRequisMois ?? 3,
          rentAmount: input.loyerEnVigueur,
          chargesAmount: input.chargesEnVigueur || 0,
          paymentDay: input.paymentDay || 5,
          depositAmount: input.depositAmount || 0,
          avanceLoyer: input.avanceLoyer || 0,
          // Horloge de gestion QAPRIL
          importMode: true,
          origineBail: "REPRISE",
          modeCreation: "REPRISE_BAIL_ANTERIEUR",
          dateReprise,
          loiApplicable: input.loiApplicable || defaultLoi,
          scanFichierSha256: scanHash,
          // Frais fiscaux & QAPRIL à 0 sur le passé
          fraisQapril: 0,
          droitsEnregistrement: 0,
          fraisTimbre: 0,
          totalFiscalBail: 0,
          statutFiscal: statutDgi,
          statutDgi,
          dgiReference: input.dgiReference || null,
          deadlineEnregistrement: null, // Pas de deadline artificielle à J+30 de l'import
          // Consentement au score non coché par défaut (demandé au locataire lors de la confirmation)
          scoreConsent: false,
          niveauCertification:
            input.qualificationBail === "ECRIT_ENREGISTRE"
              ? "REPRISE_CONTRAT_ENREGISTRE"
              : "REPRISE_DECLARATIVE",
          status:
            typeBail === TypeBail.DECLARATIF_BDQ
              ? LeaseStatus.ACTIVE_DECLARATIF
              : LeaseStatus.ACTIVE,
        },
      });

      // Si scan fourni, conserver la trace dans ScanExtraction
      if (input.scanFichierUrl) {
        await tx.scanExtraction.create({
          data: {
            leaseId: lease.id,
            fichierUrl: input.scanFichierUrl,
            champsValides: {
              startDate: startDate.toISOString(),
              loyerEnVigueur: input.loyerEnVigueur,
              qualificationBail: input.qualificationBail,
              scanFichierSha256: scanHash,
            },
            statutPipeline: "FIGE_REPRISE",
          },
        });
      }

      // Caution historique : enregistrée avec sa vraie date de versement, sans consignation CDC rétroactive forcée
      if ((input.depositAmount || 0) > 0) {
        const dateVersement = input.dateVersementCaution
          ? new Date(input.dateVersementCaution)
          : startDate;
        await tx.cautionBail.create({
          data: {
            bailId: lease.id,
            montantFcfa: input.depositAmount!,
            dateVersement,
            modeVersement: "VERSEMENT_ANTERIEUR_REPRISE",
            destination: CautionDestEnum.PROPRIETAIRE,
            conditionsRestit: "Selon contrat d'origine repris (pas de consignation CDC rétroactive imposée)",
            confirmeLocataire: false,
          },
        });
      }

      // État d'ouverture contradictoire (v1)
      const openingPayload = {
        leaseId: lease.id,
        dateReprise: dateReprise.toISOString(),
        loyerEnVigueur: input.loyerEnVigueur,
        chargesEnVigueur: input.chargesEnVigueur || 0,
        derniereRevisionAt: derniereRevisionAt ? derniereRevisionAt.toISOString() : null,
        dernierMoisPaye: input.dernierMoisPaye || null,
        soldeOuverture: input.soldeOuverture || 0,
        version: 1,
      };
      const openingHash = computeSha256(openingPayload);

      const openingState = await tx.leaseOpeningState.create({
        data: {
          leaseId: lease.id,
          dateReprise,
          loyerEnVigueur: input.loyerEnVigueur,
          chargesEnVigueur: input.chargesEnVigueur || 0,
          derniereRevisionAt,
          dernierMoisPaye: input.dernierMoisPaye || null,
          soldeOuverture: input.soldeOuverture || 0,
          sourcePreuves: (input.sourcePreuves || {}) as any,
          clausesDerogatoires: clausesDerogatoires as any,
          confirmeBailleurAt: new Date(),
          statut: "EN_ATTENTE",
          hashSha256: openingHash,
          version: 1,
        },
      });

      // Historique de loyers (si loyerInitial != loyerEnVigueur ou avenants passés fournis)
      const rentHistoryEntries: Array<{
        ancienLoyer: number;
        nouveauLoyer: number;
        effectiveLe: Date;
        motif: string;
      }> = [];

      if (input.avenantsPasses && input.avenantsPasses.length > 0) {
        for (const av of input.avenantsPasses) {
          rentHistoryEntries.push({
            ancienLoyer: av.ancienLoyer,
            nouveauLoyer: av.nouveauLoyer,
            effectiveLe: new Date(av.effectiveLe),
            motif: av.motif || "Avenant antérieur à la reprise QAPRIL",
          });
        }
      } else if (
        input.loyerInitial &&
        input.loyerInitial > 0 &&
        input.loyerInitial !== input.loyerEnVigueur
      ) {
        rentHistoryEntries.push({
          ancienLoyer: input.loyerInitial,
          nouveauLoyer: input.loyerEnVigueur,
          effectiveLe: derniereRevisionAt || startDate,
          motif: "Révision antérieure déclarée à la reprise",
        });
      }

      for (const h of rentHistoryEntries) {
        await tx.leaseRentHistory.create({
          data: {
            leaseId: lease.id,
            ancienLoyer: h.ancienLoyer,
            nouveauLoyer: h.nouveauLoyer,
            anciennesCharges: input.chargesEnVigueur || 0,
            nouvellesCharges: input.chargesEnVigueur || 0,
            motif: h.motif,
            sourceModification: "HISTORIQUE_REPRISE",
            confirmationLocataire: null,
            modifieParId: session.user.id,
            effectiveLe: h.effectiveLe,
            hashModification: computeSha256({ leaseId: lease.id, ...h }),
          },
        });
      }

      // Quittances passées : importées avec declarative = true et niveauCertification = HISTORIQUE_IMPORTE_NON_CERTIFIE
      if (input.quittancesPassees && input.quittancesPassees.length > 0) {
        for (const q of input.quittancesPassees) {
          const total = q.rentAmount + (q.chargesAmount || 0);
          const refHist = `HIST-${lease.id.slice(0, 6).toUpperCase()}-${q.periodMonth}`;
          await tx.receipt.upsert({
            where: {
              leaseId_periodMonth: {
                leaseId: lease.id,
                periodMonth: q.periodMonth,
              },
            },
            update: {},
            create: {
              receiptRef: refHist,
              leaseId: lease.id,
              periodMonth: q.periodMonth,
              moisConcerne: q.periodMonth,
              rentAmount: q.rentAmount,
              chargesAmount: q.chargesAmount || 0,
              totalAmount: total,
              paymentMethod: q.paymentMethod || "HISTORIQUE_HORS_QAPRIL",
              paidAt: q.paidAt ? new Date(q.paidAt) : new Date(`${q.periodMonth}-05T10:00:00Z`),
              status: "paid",
              declarative: true,
              niveauCertification: "HISTORIQUE_IMPORTE_NON_CERTIFIE",
              preuveUrl: q.preuveUrl || null,
              commentaireInterne: "Quittance antérieure à la reprise QAPRIL (importée à titre d'historique, non émise par QAPRIL)",
            },
          });
        }
      }

      // Initialiser la synthèse de loyer uniquement à partir du mois de dateReprise (Horloge de gestion)
      const repriseMonthKey = `${dateReprise.getFullYear()}-${String(dateReprise.getMonth() + 1).padStart(2, "0")}`;
      await tx.monthlyRentSynthesis.upsert({
        where: {
          leaseId_month: {
            leaseId: lease.id,
            month: repriseMonthKey,
          },
        },
        update: {},
        create: {
          leaseId: lease.id,
          month: repriseMonthKey,
          totalExpected: input.loyerEnVigueur + (input.chargesEnVigueur || 0),
          status: "EN_ATTENTE",
        },
      });

      // Journalisation immuable dans AuditLog
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "LEASE_REPRISE_CREATED",
          module: "LEASE_REPRISE",
          entityId: lease.id,
          newValues: {
            leaseReference: leaseRef,
            horlogeContractuelle: {
              startDate: startDate.toISOString(),
              initialEndDate: contractualClock.initialEndDate.toISOString(),
              enReconductionTacite: contractualClock.enReconductionTacite,
              prochaineEcheanceContractuelle: contractualClock.prochaineEcheanceContractuelle.toISOString(),
              derniereRevisionAt: derniereRevisionAt?.toISOString() || null,
              preavisRequisMois: input.preavisRequisMois ?? 3,
            },
            horlogeGestion: {
              dateReprise: dateReprise.toISOString(),
              repriseMonthKey,
            },
            openingStateId: openingState.id,
            openingHash,
            clausesDerogatoires,
          } as any,
          proofHash: openingHash,
        },
      });

      return { lease, openingState };
    });

    // 5. Notification contradictoire au locataire (SMS / WhatsApp) pour confirmer l'état d'ouverture
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
    const soldeText =
      (input.soldeOuverture || 0) > 0
        ? `Solde antérieur déclaré : ${Number(input.soldeOuverture).toLocaleString("fr-FR")} FCFA.`
        : "Aucun impayé antérieur déclaré (Solde : 0 FCFA).";

    const msg = `QAPRIL — Reprise de votre bail en cours (${property.name || property.address}) : Loyer actuel ${input.loyerEnVigueur.toLocaleString("fr-FR")} FCFA/mois à compter du ${dateReprise.toLocaleDateString("fr-FR")}. ${soldeText} Vérifiez et confirmez votre état d'ouverture sur ${appUrl}/mon-espace-locataire/leases/${result.lease.id}`;

    const waSent = await sendOpenWAMessage(normalizedPhone, msg).catch(() => ({ success: false }));
    if (!waSent?.success) {
      await sendSMS(normalizedPhone, msg).catch(() => null);
    }

    revalidatePath("/dashboard/leases");
    revalidatePath("/mon-espace-locataire/leases");

    return {
      success: true,
      leaseId: result.lease.id,
      leaseReference: result.lease.leaseReference,
      openingStateId: result.openingState.id,
      openingHash: result.openingState.hashSha256,
      horlogeContractuelle: {
        startDate,
        enReconductionTacite: contractualClock.enReconductionTacite,
        prochaineEcheanceContractuelle: contractualClock.prochaineEcheanceContractuelle,
      },
      horlogeGestion: {
        dateReprise,
      },
      clausesDerogatoires,
    };
  } catch (error: any) {
    console.error("[reprendreBailAnterieur Error]:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la reprise du bail antérieur.",
    };
  }
}

/**
 * [REP-02] Confirmation ou Contestation contradictoire de l'état d'ouverture (LeaseOpeningState)
 * - Si CONFIRME par les deux parties :
 *   - Scelle le hash SHA-256
 *   - Si soldeOuverture > 0, reporte l'arriéré dans LeaseArrear avec origineArriere = "OUVERTURE_REPRISE" et confirmeContradictoire = true
 *   - Enregistre le consentement explicite du locataire au score (scoreConsent) s'il est fourni
 * - Si CONTESTE par le locataire :
 *   - Statut = CONTESTE
 *   - Le bail reste actif en mode gestion simple (loyer courant et quittances)
 *   - Aucun LeaseArrear exécutoire n'est activé et un GardeFousLog bloque toute mise en demeure sur le solde d'ouverture
 */
export async function confirmerEtatOuvertureBail(params: {
  leaseId: string;
  decision: "CONFIRMER" | "CONTESTER";
  motifContestation?: string;
  scoreConsent?: boolean;
}) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const lease = await prisma.lease.findUnique({
      where: { id: params.leaseId },
      include: {
        openingState: true,
        property: true,
      },
    });

    if (!lease || !lease.openingState) {
      return { success: false, error: "État d'ouverture introuvable pour ce bail." };
    }

    const isTenant = lease.tenantId === userId;
    const isLandlordOrAgent =
      lease.landlordId === userId ||
      lease.agentId === userId ||
      lease.property.ownerUserId === userId ||
      session.user.role === Role.ADMIN ||
      session.user.role === Role.SUPER_ADMIN;

    if (!isTenant && !isLandlordOrAgent) {
      return { success: false, error: "Vous n'êtes pas partie à ce contrat de bail." };
    }

    const opening = lease.openingState;
    const now = new Date();

    if (params.decision === "CONTESTER") {
      const contestedHash = computeSha256({
        openingId: opening.id,
        leaseId: lease.id,
        statut: "CONTESTE",
        motif: params.motifContestation || "Contestation du solde ou des conditions d'ouverture",
        at: now.toISOString(),
        version: opening.version,
      });

      const updated = await prisma.$transaction(async (tx) => {
        const state = await tx.leaseOpeningState.update({
          where: { id: opening.id },
          data: {
            statut: "CONTESTE",
            motifContestation:
              params.motifContestation || "Contestation par le locataire de l'état d'ouverture",
            hashSha256: contestedHash,
          },
        });

        // S'assurer qu'aucun arriéré d'ouverture n'est marqué confirmé
        await tx.leaseArrear.updateMany({
          where: {
            leaseId: lease.id,
            origineArriere: "OUVERTURE_REPRISE",
          },
          data: {
            confirmeContradictoire: false,
            status: "contested_opening",
          },
        });

        // Enregistrer dans GardeFousLog pour bloquer toute procédure de recouvrement sur le passé
        await tx.gardeFousLog.create({
          data: {
            userId,
            typeSignal: "CONTESTATION_ETAT_OUVERTURE_REPRISE",
            detail: `Bail ${lease.leaseReference} : État d'ouverture v${opening.version} contesté (${params.motifContestation || "sans motif détaillé"}). Solde d'ouverture (${opening.soldeOuverture} FCFA) gelé. Gestion courante maintenue sans procédure.`,
            actionPrise: "GEL_ARRIERE_OUVERTURE_GESTION_SIMPLE",
            traite: false,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: "LEASE_OPENING_STATE_CONTESTED",
            module: "LEASE_REPRISE",
            entityId: lease.id,
            oldValues: { statut: opening.statut, version: opening.version } as any,
            newValues: {
              statut: "CONTESTE",
              motifContestation: params.motifContestation,
              hashSha256: contestedHash,
            } as any,
            proofHash: contestedHash,
          },
        });

        return state;
      });

      revalidatePath(`/dashboard/leases/${lease.id}`);
      revalidatePath(`/mon-espace-locataire/leases/${lease.id}`);
      return {
        success: true,
        statut: updated.statut,
        modeGestion: "GESTION_SIMPLE_SANS_PROCEDURE",
        hashSha256: updated.hashSha256,
      };
    }

    // Cas CONFIRMER
    const newConfirmeLocataireAt = isTenant ? now : opening.confirmeLocataireAt;
    const newConfirmeBailleurAt = isLandlordOrAgent ? now : opening.confirmeBailleurAt;
    const bothConfirmed = Boolean(newConfirmeLocataireAt && newConfirmeBailleurAt);
    const nextStatut = bothConfirmed ? "CONFIRME" : "EN_ATTENTE";

    const confirmedHash = computeSha256({
      openingId: opening.id,
      leaseId: lease.id,
      dateReprise: opening.dateReprise.toISOString(),
      loyerEnVigueur: opening.loyerEnVigueur,
      chargesEnVigueur: opening.chargesEnVigueur,
      soldeOuverture: opening.soldeOuverture,
      confirmeBailleurAt: newConfirmeBailleurAt?.toISOString() || null,
      confirmeLocataireAt: newConfirmeLocataireAt?.toISOString() || null,
      statut: nextStatut,
      version: opening.version,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const state = await tx.leaseOpeningState.update({
        where: { id: opening.id },
        data: {
          confirmeLocataireAt: newConfirmeLocataireAt,
          confirmeBailleurAt: newConfirmeBailleurAt,
          statut: nextStatut,
          motifContestation: null,
          hashSha256: confirmedHash,
        },
      });

      // Consentement explicite du locataire au score ICL (jamais activé par défaut à l'import)
      if (isTenant && params.scoreConsent !== undefined) {
        await tx.lease.update({
          where: { id: lease.id },
          data: {
            scoreConsent: params.scoreConsent,
            confirmationLocataireSms: true,
            confirmationLocataireAt: now,
          },
        });
      }

      // Si les deux parties ont confirmé :
      if (bothConfirmed) {
        // 1. Reporter le solde d'ouverture dans LeaseArrear UNIQUEMENT s'il est > 0 et confirmé par les deux parties
        if (opening.soldeOuverture > 0) {
          await tx.leaseArrear.upsert({
            where: {
              leaseId_dueDate: {
                leaseId: lease.id,
                dueDate: opening.dateReprise,
              },
            },
            update: {
              amount: opening.soldeOuverture,
              origineArriere: "OUVERTURE_REPRISE",
              confirmeContradictoire: true,
              openingStateId: opening.id,
              status: "unpaid",
            },
            create: {
              leaseId: lease.id,
              dueDate: opening.dateReprise,
              amount: opening.soldeOuverture,
              origineArriere: "OUVERTURE_REPRISE",
              confirmeContradictoire: true,
              openingStateId: opening.id,
              status: "unpaid",
            },
          });
        }

        // 2. Marquer la caution d'origine comme contradictoirement reconnue si présente
        await tx.cautionBail.updateMany({
          where: { bailId: lease.id },
          data: {
            confirmeLocataire: true,
            confirmeAt: now,
          },
        });

        // 3. Passer les quittances historiques importées au niveau HISTORIQUE_CONFIRME_PARTIES (toujours distinct de CERTIFIE_QAPRIL)
        await tx.receipt.updateMany({
          where: {
            leaseId: lease.id,
            declarative: true,
            niveauCertification: "HISTORIQUE_IMPORTE_NON_CERTIFIE",
          },
          data: {
            niveauCertification: "HISTORIQUE_CONFIRME_PARTIES",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: bothConfirmed
            ? "LEASE_OPENING_STATE_SEALED"
            : "LEASE_OPENING_STATE_PARTIAL_CONFIRM",
          module: "LEASE_REPRISE",
          entityId: lease.id,
          newValues: {
            statut: nextStatut,
            soldeOuverture: opening.soldeOuverture,
            bothConfirmed,
            version: opening.version,
            hashSha256: confirmedHash,
          } as any,
          proofHash: confirmedHash,
        },
      });

      return state;
    });

    revalidatePath(`/dashboard/leases/${lease.id}`);
    revalidatePath(`/mon-espace-locataire/leases/${lease.id}`);

    return {
      success: true,
      statut: updated.statut,
      bothConfirmed,
      hashSha256: updated.hashSha256,
    };
  } catch (error: any) {
    console.error("[confirmerEtatOuvertureBail Error]:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la validation de l'état d'ouverture.",
    };
  }
}

/**
 * [REP-03] Rectifier l'état d'ouverture par création d'une nouvelle version immuable (version + 1)
 * L'ancienne version est archivée intégralement dans AuditLog.oldValues avant mise à jour,
 * et la confirmation contradictoire de l'autre partie est redemandée.
 */
export async function rectifierEtatOuvertureBail(params: {
  leaseId: string;
  loyerEnVigueur?: number;
  chargesEnVigueur?: number;
  derniereRevisionAt?: Date | string | null;
  dernierMoisPaye?: string | null;
  soldeOuverture?: number;
  dateReprise?: Date | string;
  sourcePreuves?: Record<string, any>;
}) {
  try {
    const session = await ensureAuthenticated();
    await ensureLeaseAccess(params.leaseId, [
      Role.LANDLORD,
      Role.LANDLORD_PRO,
      Role.AGENCY,
      Role.ADMIN,
      Role.SUPER_ADMIN,
    ]);

    const current = await prisma.leaseOpeningState.findUnique({
      where: { leaseId: params.leaseId },
    });
    if (!current) {
      return { success: false, error: "Aucun état d'ouverture existant pour ce bail." };
    }

    const nextVersion = current.version + 1;
    const nextDateReprise = params.dateReprise ? new Date(params.dateReprise) : current.dateReprise;
    const nextLoyer = params.loyerEnVigueur ?? current.loyerEnVigueur;
    const nextCharges = params.chargesEnVigueur ?? current.chargesEnVigueur;
    const nextSolde = params.soldeOuverture ?? current.soldeOuverture;
    const nextDernierMois =
      params.dernierMoisPaye !== undefined ? params.dernierMoisPaye : current.dernierMoisPaye;
    const nextDerniereRevision =
      params.derniereRevisionAt !== undefined
        ? params.derniereRevisionAt
          ? new Date(params.derniereRevisionAt)
          : null
        : current.derniereRevisionAt;

    const newHash = computeSha256({
      leaseId: params.leaseId,
      dateReprise: nextDateReprise.toISOString(),
      loyerEnVigueur: nextLoyer,
      chargesEnVigueur: nextCharges,
      derniereRevisionAt: nextDerniereRevision?.toISOString() || null,
      dernierMoisPaye: nextDernierMois,
      soldeOuverture: nextSolde,
      version: nextVersion,
      previousHash: current.hashSha256,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const state = await tx.leaseOpeningState.update({
        where: { id: current.id },
        data: {
          dateReprise: nextDateReprise,
          loyerEnVigueur: nextLoyer,
          chargesEnVigueur: nextCharges,
          derniereRevisionAt: nextDerniereRevision,
          dernierMoisPaye: nextDernierMois,
          soldeOuverture: nextSolde,
          sourcePreuves: (params.sourcePreuves ?? current.sourcePreuves ?? {}) as any,
          confirmeBailleurAt: new Date(),
          confirmeLocataireAt: null, // Re-soumis au contradictoire du locataire
          statut: "EN_ATTENTE",
          motifContestation: null,
          hashSha256: newHash,
          version: nextVersion,
        },
      });

      await tx.lease.update({
        where: { id: params.leaseId },
        data: {
          dateReprise: nextDateReprise,
          rentAmount: nextLoyer,
          chargesAmount: nextCharges,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "LEASE_OPENING_STATE_NEW_VERSION",
          module: "LEASE_REPRISE",
          entityId: params.leaseId,
          oldValues: current as any,
          newValues: state as any,
          proofHash: newHash,
        },
      });

      return state;
    });

    revalidatePath(`/dashboard/leases/${params.leaseId}`);
    revalidatePath(`/mon-espace-locataire/leases/${params.leaseId}`);

    return {
      success: true,
      version: updated.version,
      statut: updated.statut,
      hashSha256: updated.hashSha256,
    };
  } catch (error: any) {
    console.error("[rectifierEtatOuvertureBail Error]:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la rectification de l'état d'ouverture.",
    };
  }
}

/**
 * [REP-04] Consulter l'état d'ouverture, les Deux Horloges et l'historique de loyers d'un bail repris
 */
export async function getEtatOuvertureBail(leaseId: string) {
  await ensureAuthenticated();
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      openingState: true,
      historiqueLoyers: { orderBy: { effectiveLe: "desc" } },
      caution: true,
      arrears: {
        where: { origineArriere: "OUVERTURE_REPRISE" },
      },
    },
  });

  if (!lease) return null;

  const derniereRevisionRef =
    lease.openingState?.derniereRevisionAt ||
    lease.historiqueLoyers[0]?.effectiveLe ||
    lease.startDate;

  const prochaineRevisionPossibleAt = new Date(derniereRevisionRef);
  prochaineRevisionPossibleAt.setFullYear(prochaineRevisionPossibleAt.getFullYear() + 3);

  return {
    leaseId: lease.id,
    leaseReference: lease.leaseReference,
    importMode: lease.importMode,
    origineBail: lease.origineBail,
    loiApplicable: lease.loiApplicable,
    horlogeContractuelle: {
      startDate: lease.startDate,
      endDateInitiale: lease.endDate,
      durationMonths: lease.durationMonths,
      enReconductionTacite: lease.enReconductionTacite,
      prochaineEcheanceContractuelle: lease.prochaineEcheanceContractuelle,
      preavisRequisMois: lease.preavisRequisMois ?? 3,
      derniereRevisionReferenceAt: derniereRevisionRef,
      prochaineRevisionLegalePossibleAt: prochaineRevisionPossibleAt,
    },
    horlogeGestion: {
      dateReprise: lease.dateReprise,
      statutEtatOuverture: lease.openingState?.statut || "NON_APPLICABLE",
      modeRecouvrementOuverture:
        lease.openingState?.statut === "CONFIRME"
          ? "ACTIF_CONTRADICTOIRE"
          : "CANTONNE_SANS_PROCEDURE",
    },
    openingState: lease.openingState,
    historiqueLoyers: lease.historiqueLoyers,
    caution: lease.caution,
    arrieresOuverture: lease.arrears,
  };
}

