import { prisma } from "./prisma";

/**
 * QAPRIL Feature Toggle Service
 * Centralise la vérification de l'activation des modules.
 */

export const FEATURES = {
  // Nouveaux Modules (M-PGW)
  PAYMENT_GATEWAY: "M-PGW",
  
  // Modules existants identifiés
  M17_FISCAL: "M17_FISCAL",
  CDC_CONSIGNATION: "CDC_CONSIGNATION",
  ASSURANCE_LOYER: "ASSURANCE_LOYER",
  MEDIATION_CENTER: "MEDIATION_CENTER",
  LANDING_PAGE: "LANDING_PAGE",
  
  // Mappage CDC v3.0
  KYC: "M01-M03",
  LEASES: "M04",
  MANDATES: "M05",
  MAINTENANCE: "M06-M09",
  MEDIATION: "M10-M11",
  FISCALITY: "M16",
} as const;

export type AppFeature = keyof typeof FEATURES | (typeof FEATURES)[keyof typeof FEATURES];
export type FeatureKey = AppFeature;

/**
 * Interface pour la compatibilité
 */
let featuresCache: Record<string, boolean> | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 sec

export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  const now = Date.now();
  
  if (!featuresCache || (now - lastFetch) > CACHE_TTL) {
    try {
      // Tenter de lire depuis la nouvelle table FeatureFlag
      const flags = await (prisma as any).featureFlag.findMany();
      if (flags.length > 0) {
        featuresCache = flags.reduce((acc: any, flag: any) => {
          acc[flag.id] = flag.enabled;
          return acc;
        }, {});
      } else {
        // Fallback sur l'ancien système systemConfig si la table est vide
        const config = await (prisma as any).systemConfig.findUnique({
          where: { key: "feature_flags" }
        });
        featuresCache = config?.value as Record<string, boolean> || {};
      }
      lastFetch = now;
    } catch (error) {
      console.error("[Features] Erreur chargement :", error);
      return true;
    }
  }

  // Vérifier par ID (M-PGW) ou par Clé (M17_FISCAL)
  return featuresCache?.[key as string] ?? true;
}

/**
 * Throws an error or handles logic if a feature is disabled
 */
export async function ensureFeatureEnabled(key: FeatureKey) {
  const enabled = await isFeatureEnabled(key);
  if (!enabled) {
    throw new Error(`La fonctionnalité ${key} est actuellement désactivée.`);
  }
}

export function invalidateFeaturesCache() {
  featuresCache = null;
  lastFetch = 0;
}
