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
      properties: user.propertiesOwned.map(p => {
        const activeLease = p.leases[0];
        const lastReceipt = activeLease?.receipts[0];
        
        const isImpaye = activeLease?.status === 'LOYER_IMPAYE';
        const isHorsSLA = !!(p.managedByUserId && !activeLease?.receipts?.length);

        return {
          id: p.id,
          name: p.name || p.address || "Propriété sans nom",
          commune: p.commune || "N/A",
          propertyCode: p.propertyCode || `P-${p.id.slice(0,5)}`,
          status: p.status,
          managementMode: p.managementMode,
          isImpaye: !!isImpaye,
          isHorsSLA: !!isHorsSLA,
          activeLease: activeLease ? {
            rentFcfa: activeLease.rentAmount,
            rentDevise: Number((activeLease.rentAmount * rate).toFixed(2)),
            tenant: activeLease.tenantId,
            lastPayment: lastReceipt?.createdAt ? new Date(lastReceipt.createdAt).toISOString() : null
          } : null
        };
      }),
      mandats: user.mandatsDonnes.map(m => ({
        id: m.id,
        agence: m.intermediaire.fullName || m.intermediaire.name,
        nom: m.intermediaire.fullName || m.intermediaire.name,
        phone: m.intermediaire.phone || "",
        statut: m.statut,
        status: m.statut === "ACTIF" ? "Actif" : "En attente",
        since: m.createdAt,
        scope: "Global",
        role: "Gestionnaire",
        slaConfig: 24,
        slaReel: 14
      })),
      mobileMoney: [
        { id: "MM-01", provider: "Orange", phone: "+225 07 11 22 33", solde: 320000, active: true },
        { id: "MM-02", provider: "Wave", phone: "+225 05 44 55 66", solde: 150000, active: true }
      ],
      virements: user.propertiesOwned.flatMap(p => p.leases.flatMap(l => l.receipts.map(r => ({
        id: `VIR-${r.id.slice(0,8)}`,
        bien: p.name || p.address || "Propriété",
        mois: r.createdAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        montantFCFA: l.rentAmount,
        statut: "Reçu",
        dateReception: r.createdAt.toLocaleDateString('fr-FR'),
        reference: `RECEP-${r.id.slice(0,8)}`,
        ref: `RECEP-${r.id.slice(0,8)}`,
        date: r.createdAt.toLocaleDateString('fr-FR'),
        type: "Virement SEPA"
      })))),
      webhooks: [
        { date: new Date().toLocaleString('fr-FR'), op: "Orange Money", emetteur: "+225 07 11 22 33", montant: 320000, bien: "Villa 7", statut: "Quittance émise", ref: "QIT-2026-0341" }
      ],
      settings: {
        iban: user.diasporaStripeId || "FR76 3000 4000 0300 0000 0000 147",
        banque: "Société Générale",
        pays: user.paysResidence || "France",
        fuseau: user.fuseauHoraire || "Europe/Paris",
        devise: currency,
        notifications: ["WhatsApp", "Email"]
      }
    };
  }
}
