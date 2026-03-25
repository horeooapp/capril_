import { prisma } from "./prisma";
import { NotificationService } from "./notification-service";
import { UtilityType, UtilityMode, RepartitionModel, UtilityStatus } from "@prisma/client";

export interface BillInfo {
  identifiantCompteur: string;
  moisFacture: Date;
  montantTotal: number;
  dateLimitePaiement?: Date;
  source: string;
}

export class UtilityService {
  /**
   * Tunnel Mobile Money (UTL-02)
   */
  static async consulterFacture(identifiant: string, type: UtilityType): Promise<BillInfo | null> {
    const operators = ["ORANGE", "MTN", "MOOV", "WAVE"];
    for (const op of operators) {
      try {
        const info = await this.mockApiConsultation(op, identifiant, type);
        if (info) return info;
      } catch (e) {
        console.warn(`[UTILITY_TUNNEL] ${op} failed:`, e);
      }
    }
    return null;
  }

  private static async mockApiConsultation(operator: string, identifiant: string, type: UtilityType): Promise<BillInfo | null> {
    if (identifiant.endsWith("000")) return null; 
    return {
      identifiantCompteur: identifiant,
      moisFacture: new Date(),
      montantTotal: 15000 + Math.floor(Math.random() * 20000),
      dateLimitePaiement: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      source: `API_${operator}`,
    };
  }

  /**
   * Création et Répartition de facture (UTL-04)
   */
  static async repartirFacture(data: {
    leaseId: string;
    acteurId: string;
    roleActeur: string;
    typeUtility: UtilityType;
    identifiantCompteur: string;
    moisFacture: Date;
    montantTotal: number;
    source: string;
  }) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
      include: {
        property: {
          include: {
            leasesAsProperty: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!lease) throw new Error("Lease non trouvé");

    const facture = await (prisma as any).factureUtility.create({
      data: {
        leaseId: data.leaseId,
        acteurId: data.acteurId,
        roleActeur: data.roleActeur,
        typeUtility: data.typeUtility,
        identifiantCompteur: data.identifiantCompteur,
        moisFacture: data.moisFacture,
        montantTotal: data.montantTotal,
        source: data.source,
        modeUtilities: lease.modeUtilities,
      },
    });

    if (lease.modeUtilities === "PARTAGÉ_PROPRIO" || lease.modeUtilities === "MIXTE") {
      const activeLeases = lease.property.leasesAsProperty;
      const nbLeases = activeLeases.length;

      for (const targetLease of activeLeases) {
        let quotePart = 0;
        if (lease.modeleRepartition === "PRORATA_CHAMBRE") {
          quotePart = Number(data.montantTotal) / nbLeases;
        } else if (lease.modeleRepartition === "FORFAIT_FIXE") {
          quotePart = Number(lease.forfaitUtilitiesMensuel) || 0;
        }

        if (targetLease.tenantId) {
          await (prisma as any).repartitionUtility.create({
            data: {
              factureId: facture.id,
              leaseLocataireId: targetLease.id,
              locataireId: targetLease.tenantId,
              montantQuotePart: quotePart,
              modeleApplique: lease.modeleRepartition,
              statutPaiement: "EN_ATTENTE",
              dateNotification: new Date(),
            },
          });

          await NotificationService.envoyerNotification(
            targetLease.tenantId,
            "FACTURE_UTILITY_DISPO",
            {
              payload: {
                titre: `Nouvelle facture ${data.typeUtility}`,
                message: `Votre quote-part pour la facture ${data.typeUtility} est de ${quotePart.toLocaleString()} FCFA.`,
                factureId: facture.id,
                montant: quotePart
              }
            }
          );
        }
      }
    }

    return facture;
  }
}
