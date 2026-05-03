import { prisma } from "./prisma";
import { redis } from "./redis";

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
  PAYMENT_TEST_MODE: "PAYMENT_TEST_MODE",
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
  BDQ_VERBAL: "M-BAIL-VERBAL",
  AI_ASSISTANT: "ADD-08-AI",

  // ═══════════════════════════════════════════════════════
  // CONFIGURATION ACCUEIL (HOME)
  // ═══════════════════════════════════════════════════════
  HOME_IMPACT_STATS: "HOME_IMPACT_STATS",
  HOME_OBSERVATORY: "HOME_OBSERVATORY",
  HOME_GEO_ANALYSIS: "HOME_GEO_ANALYSIS",
  HOME_RENT_RANKING: "HOME_RENT_RANKING",
  DIASPORA_PACKAGE: "DIASPORA_PACKAGE",
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
  const REDIS_KEY = "qapril:feature_flags";
  
  // 1. Try local memory cache first (ultra-fast)
  if (featuresCache && (now - lastFetch) <= CACHE_TTL) {
    return featuresCache?.[key as string] ?? true;
  }

  try {
    // 2. Try Redis (Distributed cache)
    if (redis && redis.status !== 'mock') {
      const cached = await redis.get(REDIS_KEY);
      if (cached) {
        featuresCache = JSON.parse(cached);
        lastFetch = now;
        return featuresCache?.[key as string] ?? true;
      }
    }

    // 3. Database Fallback
    console.log(`[Features] Cache miss for ${key}, fetching from DB...`);
    let flags: any[] = [];
    if ((prisma as any).featureFlag) {
      flags = await (prisma as any).featureFlag.findMany();
    }
    
    let newCache: Record<string, boolean> = {};
    if (flags && flags.length > 0) {
      newCache = flags.reduce((acc: any, flag: any) => {
        acc[flag.id] = flag.enabled;
        return acc;
      }, {});
    }
    
    const config = await (prisma as any).systemConfig.findUnique({
      where: { key: "feature_flags" }
    });
    if (config?.value) {
      const oldFlags = config.value as Record<string, boolean>;
      newCache = { ...oldFlags, ...newCache };
    }

    featuresCache = newCache;
    lastFetch = now;

    // 4. Update Redis
    if (redis && redis.status !== 'mock') {
      await redis.set(REDIS_KEY, JSON.stringify(newCache), "EX", 60); // 60s global TTL
    }

    return featuresCache?.[key as string] ?? true;
  } catch (error) {
    console.error("[Features] Erreur chargement :", error);
    return featuresCache?.[key as string] ?? true;
  }
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
