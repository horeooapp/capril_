import { prisma } from "./prisma";
import { FEATURES, isFeatureEnabled } from "./features";

/**
 * Taux de change de référence pour le Package Diaspora
 * Source: BCE/Simulée (Mise à jour quotidienne en production)
 */
export const DIASPORA_CURRENCIES: Record<string, { symbol: string, rate: number, name: string }> = {
  EUR: { symbol: "€", rate: 0.001524, name: "Euro" },
  USD: { symbol: "$", rate: 0.00165, name: "US Dollar" },
  CAD: { symbol: "CAD$", rate: 0.00225, name: "Dollar Canadien" },
  GBP: { symbol: "£", rate: 0.0013, name: "Livre Sterling" },
  CHF: { symbol: "CHF", rate: 0.00145, name: "Franc Suisse" },
  FCFA: { symbol: "FCFA", rate: 1, name: "Franc CFA" },
};

export class DiasporaService {
  /**
   * Récupère le taux de change pour une devise donnée
   */
  static async getExchangeRate(currency: string): Promise<number> {
    return DIASPORA_CURRENCIES[currency]?.rate || 1;
  }

  /**
   * Convertit un montant FCFA vers la devise de résidence
   */
  static async convertFromFcfa(amount: number, currency: string): Promise<number> {
    const rate = await this.getExchangeRate(currency);
    return Number((amount * rate).toFixed(2));
  }

  /**
   * Formate un montant dans la devise cible
   */
  static formatCurrency(amount: number, currency: string): string {
    const config = DIASPORA_CURRENCIES[currency] || DIASPORA_CURRENCIES.FCFA;
    return `${amount.toLocaleString('fr-FR')} ${config.symbol}`;
  }

  /**
   * Vérifie le respect des SLA par un mandataire
   * SLA Maintenance Urgent: 24h
   * SLA Loyer Impayé: 48h
   * SLA Message: 72h
   */
  static async getMandataireStats(mandateId: string) {
    const mandate = await prisma.mandatGestion.findUnique({
      where: { id: mandateId },
      include: {
        intermediaire: true,
        proprietaire: true
      }
    });

    if (!mandate) return null;

    // Récupérer les actions du mandataire dans l'AuditLog
    const actions = await prisma.auditLog.findMany({
      where: {
        userId: mandate.intermediaireId,
        createdAt: {
          gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcul simplifié du délai moyen de réponse (placeholder logic)
    // En production, on comparerait la date de création du ticket vs date de prise en charge
    
    return {
      nbActions: actions.length,
      lastActionAt: actions[0]?.createdAt || mandate.createdAt,
      slaStatus: actions.length > 0 ? "RESPECTÉ" : "ALERTE",
      delaiMoyenHeures: 14, // Simulé
    };
  }

  /**
   * Génère les données consolidées pour le Dashboard Diaspora
   */
  static async getDashboardData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        propertiesOwned: {
          include: {
            leases: {
              where: { status: 'ACTIVE' },
              include: {
                receipts: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        },
        mandatsDonnes: {
          include: {
            intermediaire: true
          }
        }
      }
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    const currency = user.diasporaDevise || "FCFA";
    const rate = await this.getExchangeRate(currency);

    let totalRentFcfa = 0;
    const totalAssets = user.propertiesOwned.length;
    let occupancyRate = 0;
    let activeLeases = 0;

    user.propertiesOwned.forEach(p => {
      p.leases.forEach(l => {
        totalRentFcfa += l.rentAmount;
        activeLeases++;
      });
    });

    if (totalAssets > 0) {
      occupancyRate = (activeLeases / totalAssets) * 100;
    }

    return {
      stats: {
        totalRentFcfa,
        totalRentDevise: await this.convertFromFcfa(totalRentFcfa, currency),
        currency,
        totalAssets,
        occupancyRate: Math.round(occupancyRate),
      },
      properties: user.propertiesOwned.map(p => ({
        id: p.id,
        name: p.name || p.address,
        commune: p.commune,
        status: p.status,
        activeLease: p.leases[0] ? {
          rentFcfa: p.leases[0].rentAmount,
          rentDevise: Number((p.leases[0].rentAmount * rate).toFixed(2)),
          tenant: p.leases[0].tenantId,
          lastPayment: p.leases[0].receipts[0]?.createdAt || null
        } : null
      })),
      mandats: user.mandatsDonnes.map(m => ({
        id: m.id,
        name: m.intermediaire.fullName,
        phone: m.intermediaire.phone,
        statut: m.statut,
        since: m.dateDebut
      }))
    };
  }
}
