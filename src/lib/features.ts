import { prisma } from "./prisma";

/**
 * QAPRIL Feature Toggle Service
 * Centralise la vérification de l'activation des modules.
 */

export const FEATURES = {
  // Modules Identifiés dans SystemPage
  M17_FISCAL: "M17_FISCAL",
  M16_ANAH: "M16_ANAH",
  CDC_CONSIGNATION: "CDC_CONSIGNATION",
  ASSURANCE_LOYER: "ASSURANCE_LOYER",
  MEDIATION_CENTER: "MEDIATION_CENTER",
  KYC_VERIFICATION: "KYC_VERIFICATION",
  SMS_NOTIFICATIONS: "SMS_NOTIFICATIONS",
  USSD_PORTAL: "USSD_PORTAL",
  NEWS_TICKER: "NEWS_TICKER",
  LANDING_PAGE: "LANDING_PAGE",
  M_MANDAT: "M_MANDAT",
  M_COLOC: "M_COLOC",
  M_TERRAIN: "M_TERRAIN",

  // Nouveaux Modules & Mappage CDC v3.0
  PAYMENT_GATEWAY: "M-PGW",
  KYC: "M01-M03",
  LEASES: "M04",
  MANDATES: "M05",
  MAINTENANCE: "M06-M09",
  MEDIATION: "M10-M11",
  FISCALITY: "M16",

  // ═══════════════════════════════════════════════════════
  // MODULES DE RÉTENION AGENCES (ADD-03)
  // ═══════════════════════════════════════════════════════
  EDL: "M-EDL",
  SIGNATURES: "M-SIGN",
  MAINTENANCE_MODULE: "M-MAINT",
  CANDIDATURES: "M-CAND",
  CHARGES: "M-CHARGES",
  ANNONCES: "M-ANNONCES",
  COMPTABILITE: "M-COMPTA",
  AGENDA: "M-AGENDA",
} as const;

export type AppFeature = keyof typeof FEATURES | (typeof FEATURES)[keyof typeof FEATURES] | string;
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
      // 1. Tenter la nouvelle table FeatureFlag
      const flags = await (prisma as any).featureFlag.findMany();
      if (flags.length > 0) {
        featuresCache = flags.reduce((acc: any, flag: any) => {
          acc[flag.id] = flag.enabled;
          return acc;
        }, {});
      }
      
      // 2. Fusionner avec l'ancien système systemConfig (feature_flags key)
      const config = await (prisma as any).systemConfig.findUnique({
        where: { key: "feature_flags" }
      });
      if (config?.value) {
        const oldFlags = config.value as Record<string, boolean>;
        featuresCache = { ...oldFlags, ...(featuresCache || {}) };
      }

      if (!featuresCache) featuresCache = {};
      lastFetch = now;
    } catch (error) {
      console.error("[Features] Erreur chargement :", error);
      return true;
    }
  }

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
