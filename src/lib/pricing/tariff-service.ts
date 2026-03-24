import { prisma } from "@/lib/prisma";
import { NegocieType, PromoType } from "@prisma/client";

/**
 * TARIFF SERVICE - ADD-12
 * Handles priority-based pricing resolution:
 * 1. Negotiated Tariff (User específica override)
 * 2. Promo Code (External input or linked)
 * 3. Subscription Plan (Based on User.planTier)
 * 4. Global Configuration (Fallback)
 */
export class TariffService {
  /**
   * Resolves the price for a specific service and user.
   */
  static async resolvePrice(userId: string, serviceType: NegocieType, promoCode?: string): Promise<number> {
    const today = new Date();

    // 1. PRIORITÉ : TARIF NÉGOCIÉ (Account override)
    const negocie = await prisma.tarifNegocie.findFirst({
      where: {
        userId,
        type: serviceType,
        dateDebut: { lte: today },
        OR: [{ dateFin: null }, { dateFin: { gte: today } }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (negocie) {
      return Number(negocie.prixNegocieTtc);
    }

    // 2. PRIORITÉ : CODE PROMO (If provided)
    if (promoCode) {
      const promo = await this.validatePromo(promoCode, userId);
      if (promo.valid) {
        // Apply discount logic here if needed, or return the fixed price from promo
        // In ADD-12, promos can be specific to an offer or global.
      }
    }

    // 3. PRIORITÉ : OFFRE ABONNEMENT (Based on PlanTier)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true },
    });

    if (user) {
      const offer = await prisma.offreAbonnement.findFirst({
        where: {
          code: user.planTier, // Assuming codes match PlanTier names (GRATUIT, ESSENTIEL, etc.)
          actif: true,
        },
      });

      if (offer) {
        // Handle inclusive units
        if (serviceType === "QUITTANCE_DEROGATOIRE") {
          const usage = await this.getCurrentMonthUsage(userId, "QUITTANCE");
          if (offer.quittancesInclus === 0 || usage < offer.quittancesInclus) {
            return 0; // Included in plan
          }
          return Number(offer.prixUniteTtc || 0);
        }
      }
    }

    // 4. PRIORITÉ : CONFIGURATION GLOBALE (Fallback)
    const configKey = this.mapServiceToConfigKey(serviceType);
    const config = await prisma.configTarif.findUnique({
      where: { cle: configKey },
    });

    return config ? Number(config.valeur) : this.getDefaultPrice(serviceType);
  }

  /**
   * Validates a promo code.
   */
  static async validatePromo(code: string, userId?: string) {
    const today = new Date();
    const promo = await prisma.codePromo.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: { offreCible: true },
    });

    if (!promo || !promo.actif) return { valid: false, message: "Invalide" };
    if (promo.dateDebut > today || (promo.dateFin && promo.dateFin < today)) return { valid: false, message: "Expiré" };
    if (promo.maxUtilisations && promo.nbUtilisations >= promo.maxUtilisations) return { valid: false, message: "Limite atteinte" };

    return { valid: true, promo };
  }

  /**
   * Internal helper to count current month usage.
   */
  private static async getCurrentMonthUsage(userId: string, service: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count SMS declarations or Payment receipts
    if (service === "QUITTANCE") {
      return await prisma.receipt.count({
        where: {
          lease: {
            property: {
              ownerId: userId // Or agencyId if applicable
            }
          },
          createdAt: { gte: startOfMonth },
        },
      });
    }
    return 0;
  }

  private static mapServiceToConfigKey(type: NegocieType): string {
    switch (type) {
      case "QUITTANCE_DEROGATOIRE": return "price_quittance_standard";
      case "ABONNEMENT_DEROGATOIRE": return "price_subscription_standard";
      case "ENREGISTREMENT_DEROGATOIRE": return "price_registration_standard";
      default: return "default_fee";
    }
  }

  private static getDefaultPrice(type: NegocieType): number {
    switch (type) {
      case "QUITTANCE_DEROGATOIRE": return 75;
      case "ABONNEMENT_DEROGATOIRE": return 5000;
      case "ENREGISTREMENT_DEROGATOIRE": return 10000;
      default: return 0;
    }
  }

  /**
   * Logs a tariff change for audit (ADD-12 Requirement).
   */
  static async logAudit(table: string, id: string, action: string, before: any, after: any, adminId: string) {
    await prisma.configTarifsAudit.create({
      data: {
        tableCible: table,
        enregistrementId: id,
        action,
        avant: before,
        apres: after,
        modifieParId: adminId,
      },
    });
  }
}
