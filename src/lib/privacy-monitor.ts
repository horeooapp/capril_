/**
 * PRIVACY BY DESIGN — Principe 1 : Proactive, not Reactive
 * Moniteur de détection d'anomalies d'accès aux données personnelles.
 *
 * Détecte :
 * - Accès massifs à des profils utilisateurs (data scraping)
 * - Exports de données en rafale
 * - Patterns d'accès anormaux (heure inhabituelle, volume inhabituel)
 * - Tentatives d'énumération de données
 */

import { redis } from "./redis";
import { logPrivacyEvent } from "./consent-manager";

// ─── Configuration des seuils ─────────────────────────────────────────────────

const THRESHOLDS = {
  /** Nombre max de profils distincts consultables par heure */
  MAX_PROFILES_PER_HOUR: 50,
  /** Nombre max d'exports de données par 24h */
  MAX_EXPORTS_PER_DAY: 5,
  /** Nombre max d'accès aux documents sensibles (RESTRICTED) par heure */
  MAX_SENSITIVE_ACCESS_PER_HOUR: 10,
  /** Nombre max de requêtes sur données PII par minute */
  MAX_PII_REQUESTS_PER_MINUTE: 30,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonitoredAction =
  | "PROFILE_VIEW"      // Consultation d'un profil utilisateur
  | "DATA_EXPORT"       // Export de données
  | "SENSITIVE_ACCESS"  // Accès à des données RESTRICTED
  | "PII_QUERY"         // Requête contenant des données PII
  | "BULK_SEARCH";      // Recherche volumineuse

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  threshold: number;
}

// ─── Compteurs Redis ──────────────────────────────────────────────────────────

/** Cache mémoire de secours si Redis indisponible */
const memoryCounters = new Map<string, { count: number; expiresAt: number }>();

async function increment(key: string, windowSec: number): Promise<number> {
  if (redis) {
    try {
      const fullKey = `qapril:privacy-monitor:${key}`;
      const count = await redis.incr(fullKey);
      if (count === 1) await redis.expire(fullKey, windowSec);
      return count;
    } catch {
      // Fallback mémoire
    }
  }

  // Fallback in-memory
  const now = Date.now();
  const entry = memoryCounters.get(key);
  if (!entry || now > entry.expiresAt) {
    memoryCounters.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
    return 1;
  }
  entry.count++;
  return entry.count;
}

async function getCount(key: string): Promise<number> {
  if (redis) {
    try {
      const fullKey = `qapril:privacy-monitor:${key}`;
      const val = await redis.get(fullKey);
      return parseInt(val as string || "0", 10);
    } catch {}
  }
  return memoryCounters.get(key)?.count ?? 0;
}

// ─── Vérifications d'accès ────────────────────────────────────────────────────

/**
 * Vérifie si un utilisateur peut accéder à un profil tiers.
 * Limite le nombre de profils consultés par heure pour détecter le scraping.
 */
export async function checkProfileAccess(
  requesterId: string
): Promise<AccessCheckResult> {
  const key = `profile-view:${requesterId}`;
  const count = await increment(key, 3600);
  const threshold = THRESHOLDS.MAX_PROFILES_PER_HOUR;

  if (count > threshold) {
    await logPrivacyEvent({
      userId: requesterId,
      eventType: "SUSPICIOUS_ACCESS",
      severity: "WARNING",
      resource: "users.profile",
      details: {
        action: "PROFILE_VIEW",
        count,
        threshold,
        window: "1h",
      },
    });

    return { allowed: false, reason: "RATE_LIMIT_PROFILES", currentCount: count, threshold };
  }

  return { allowed: true, currentCount: count, threshold };
}

/**
 * Vérifie si un utilisateur peut exporter des données.
 * Limite à N exports par 24h.
 */
export async function checkDataExportAccess(
  requesterId: string
): Promise<AccessCheckResult> {
  const key = `data-export:${requesterId}`;
  const count = await increment(key, 86400); // 24h
  const threshold = THRESHOLDS.MAX_EXPORTS_PER_DAY;

  if (count > threshold) {
    await logPrivacyEvent({
      userId: requesterId,
      eventType: "SUSPICIOUS_ACCESS",
      severity: "CRITICAL",
      resource: "data_export",
      details: {
        action: "DATA_EXPORT",
        count,
        threshold,
        window: "24h",
      },
    });

    return { allowed: false, reason: "RATE_LIMIT_EXPORT", currentCount: count, threshold };
  }

  return { allowed: true, currentCount: count, threshold };
}

/**
 * Vérifie si un utilisateur peut accéder à des données RESTRICTED (MRZ, docNumber).
 * Tolérance très basse — alerte dès 10 accès/heure.
 */
export async function checkSensitiveDataAccess(
  requesterId: string,
  resource: string
): Promise<AccessCheckResult> {
  const key = `sensitive-access:${requesterId}`;
  const count = await increment(key, 3600);
  const threshold = THRESHOLDS.MAX_SENSITIVE_ACCESS_PER_HOUR;

  // Log systématique de tout accès à des données sensibles
  await logPrivacyEvent({
    userId: requesterId,
    eventType: "DATA_ACCESSED",
    severity: count > threshold / 2 ? "WARNING" : "INFO",
    resource,
    details: { action: "SENSITIVE_ACCESS", count, threshold, window: "1h" },
  });

  if (count > threshold) {
    await logPrivacyEvent({
      userId: requesterId,
      eventType: "SUSPICIOUS_ACCESS",
      severity: "CRITICAL",
      resource,
      details: {
        action: "SENSITIVE_ACCESS_EXCEEDED",
        count,
        threshold,
        window: "1h",
      },
    });

    return { allowed: false, reason: "RATE_LIMIT_SENSITIVE", currentCount: count, threshold };
  }

  return { allowed: true, currentCount: count, threshold };
}

/**
 * Détecte une recherche bulk inhabituelle (ex: export de toute la base).
 */
export async function checkBulkQueryAccess(
  requesterId: string,
  querySize: number
): Promise<AccessCheckResult> {
  const MAX_RESULTS = 1000;

  if (querySize > MAX_RESULTS) {
    await logPrivacyEvent({
      userId: requesterId,
      eventType: "SUSPICIOUS_ACCESS",
      severity: "CRITICAL",
      resource: "bulk_query",
      details: {
        action: "BULK_QUERY",
        querySize,
        maxAllowed: MAX_RESULTS,
      },
    });

    return {
      allowed: false,
      reason: "BULK_QUERY_TOO_LARGE",
      currentCount: querySize,
      threshold: MAX_RESULTS,
    };
  }

  return { allowed: true, currentCount: querySize, threshold: MAX_RESULTS };
}

// ─── Rapport de monitoring ────────────────────────────────────────────────────

/**
 * Retourne les utilisateurs ayant déclenché des alertes récentes.
 * Utilisé par le DPO pour la surveillance.
 */
export async function getRecentPrivacyAlerts(
  limit = 50
): Promise<Array<{
  userId: string | null;
  eventType: string;
  severity: string;
  resource: string | null;
  details: unknown;
  createdAt: Date;
}>> {
  const { prisma } = await import("./prisma");

  return prisma.privacyEventLog.findMany({
    where: {
      severity: { in: ["WARNING", "CRITICAL"] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      userId: true,
      eventType: true,
      severity: true,
      resource: true,
      details: true,
      createdAt: true,
    },
  });
}
