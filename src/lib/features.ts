import { prisma } from "./prisma";

/**
 * QAPRIL Feature Toggle Service
 * Centralise la vérification de l'activation des modules.
 */

export const FEATURES = {
  KYC: "M01-M03",
  LEASES: "M04",
  MANDATES: "M05",
  MAINTENANCE: "M06-M09",
  MEDIATION: "M10-M11",
  FISCALITY: "M16",
  PAYMENT_GATEWAY: "M-PGW",
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];

/**
 * Vérifie si une fonctionnalité est activée.
 * Utilise un cache simple en mémoire pour éviter les requêtes DB répétitives sur un même cycle.
 */
let featuresCache: Record<string, boolean> | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 sec

export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  const now = Date.now();
  
  if (!featuresCache || (now - lastFetch) > CACHE_TTL) {
    try {
      const flags = await (prisma as any).featureFlag.findMany();
      featuresCache = flags.reduce((acc: any, flag: any) => {
        acc[flag.id] = flag.enabled;
        return acc;
      }, {});
      lastFetch = now;
    } catch (error) {
      console.error("[Features] Erreur lors du chargement des flags :", error);
      return true; // Mode dégradé : tout activé par défaut en cas d'erreur
    }
  }

  return featuresCache?.[key] ?? true;
}

/**
 * Force le rechargement du cache (ex: après une modification admin)
 */
export function invalidateFeaturesCache() {
  featuresCache = null;
  lastFetch = 0;
}
