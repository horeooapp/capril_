/**
 * PRIVACY BY DESIGN — Principe 2 & 7
 * Gestionnaire centralisé des consentements RGPD / Loi ivoirienne 2013-450
 *
 * Privacy by Default : aucun consentement n'est présumé.
 * Chaque traitement de données doit être explicitement autorisé.
 */

import { prisma } from "./prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConsentType =
  | "ANALYTICS"       // Analyse du comportement d'utilisation
  | "MARKETING"       // Emails/SMS promotionnels
  | "DATA_SHARING"    // Partage avec tiers (agences, assureurs)
  | "SCORING"         // Calcul de score de fiabilité locataire
  | "COOKIES"         // Cookies non-essentiels
  | "PROFILING";      // Profilage comportemental

export type LegalBasis =
  | "CONSENT"               // Consentement explicite
  | "CONTRACT"              // Exécution d'un contrat
  | "LEGAL_OBLIGATION"      // Obligation légale
  | "LEGITIMATE_INTEREST"   // Intérêt légitime
  | "VITAL_INTEREST"        // Intérêt vital
  | "PUBLIC_TASK";          // Mission d'intérêt public

export type ConsentSource = "WEB" | "MOBILE" | "API" | "PAPER";

export interface ConsentRecord {
  id: string;
  userId: string;
  typeConsentement: ConsentType;
  version: string;
  granted: boolean;
  grantedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
  source: string | null;
  legalBasis: string | null;
  createdAt: Date;
}

export interface GrantConsentInput {
  userId: string;
  type: ConsentType;
  legalBasis?: LegalBasis;
  source?: ConsentSource;
  ipAddress?: string;
  userAgent?: string;
  /** Durée de validité en jours. Si omis, le consentement n'expire pas. */
  expiryDays?: number;
  version?: string;
}

export interface ConsentCheckResult {
  granted: boolean;
  reason: "GRANTED" | "NOT_FOUND" | "REVOKED" | "EXPIRED" | "NEVER_CONSENTED";
  expiresAt?: Date | null;
}

// ─── Version courante de la politique ─────────────────────────────────────────

/** Incrémentez cette version à chaque mise à jour majeure de la politique */
export const CURRENT_PRIVACY_POLICY_VERSION = "1.0";

// ─── Fonctions principales ────────────────────────────────────────────────────

/**
 * Vérifie si un utilisateur a accordé un consentement valide pour un type donné.
 * Privacy by Default : retourne false si aucun consentement trouvé.
 */
export async function checkConsent(
  userId: string,
  type: ConsentType
): Promise<ConsentCheckResult> {
  const consent = await prisma.userConsent.findFirst({
    where: { userId, typeConsentement: type },
    orderBy: { createdAt: "desc" },
  });

  if (!consent) return { granted: false, reason: "NEVER_CONSENTED" };
  if (!consent.granted || consent.revokedAt) return { granted: false, reason: "REVOKED" };

  if (consent.expiresAt && consent.expiresAt < new Date()) {
    return { granted: false, reason: "EXPIRED", expiresAt: consent.expiresAt };
  }

  return { granted: true, reason: "GRANTED", expiresAt: consent.expiresAt };
}

/**
 * Accorde un consentement à un utilisateur.
 * Crée un nouvel enregistrement (historique complet conservé).
 */
export async function grantConsent(input: GrantConsentInput): Promise<ConsentRecord> {
  const {
    userId,
    type,
    legalBasis = "CONSENT",
    source = "WEB",
    ipAddress,
    userAgent,
    expiryDays,
    version = CURRENT_PRIVACY_POLICY_VERSION,
  } = input;

  const expiresAt = expiryDays
    ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    : null;

  const consent = await prisma.userConsent.create({
    data: {
      userId,
      typeConsentement: type,
      version,
      granted: true,
      grantedAt: new Date(),
      revokedAt: null,
      expiresAt,
      source,
      legalBasis,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
    },
  });

  await logPrivacyEvent({
    userId,
    eventType: "CONSENT_GRANTED",
    severity: "INFO",
    resource: `consent.${type}`,
    details: { type, version, legalBasis, source },
    ipAddress,
  });

  return consent as unknown as ConsentRecord;
}

/**
 * Révoque un consentement.
 * L'enregistrement est mis à jour (jamais supprimé — traçabilité obligatoire).
 */
export async function revokeConsent(
  userId: string,
  type: ConsentType,
  ipAddress?: string
): Promise<void> {
  await prisma.userConsent.updateMany({
    where: { userId, typeConsentement: type, granted: true, revokedAt: null },
    data: { granted: false, revokedAt: new Date() },
  });

  await logPrivacyEvent({
    userId,
    eventType: "CONSENT_REVOKED",
    severity: "INFO",
    resource: `consent.${type}`,
    details: { type },
    ipAddress,
  });
}

/**
 * Révoque tous les consentements d'un utilisateur (ex: suppression de compte).
 */
export async function revokeAllConsents(userId: string): Promise<void> {
  await prisma.userConsent.updateMany({
    where: { userId, granted: true, revokedAt: null },
    data: { granted: false, revokedAt: new Date() },
  });

  await logPrivacyEvent({
    userId,
    eventType: "CONSENT_REVOKED",
    severity: "WARNING",
    resource: "consent.ALL",
    details: { action: "BULK_REVOCATION" },
  });
}

/**
 * Retourne tous les consentements actifs d'un utilisateur.
 */
export async function listActiveConsents(userId: string): Promise<ConsentRecord[]> {
  const consents = await prisma.userConsent.findMany({
    where: { userId, granted: true, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  return consents.filter(
    (c) => !c.expiresAt || c.expiresAt > now
  ) as unknown as ConsentRecord[];
}

/**
 * Retourne l'historique complet des consentements (accordés + révoqués).
 */
export async function getConsentHistory(userId: string): Promise<ConsentRecord[]> {
  return prisma.userConsent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  }) as unknown as Promise<ConsentRecord[]>;
}

/**
 * Retourne les consentements proches de l'expiration (pour envoi de rappels).
 */
export async function getExpiredConsents(
  daysBeforeExpiry = 14
): Promise<Array<{ userId: string; typeConsentement: string; expiresAt: Date }>> {
  const limit = new Date(Date.now() + daysBeforeExpiry * 24 * 60 * 60 * 1000);

  return prisma.userConsent.findMany({
    where: {
      granted: true,
      revokedAt: null,
      expiresAt: { lte: limit, gte: new Date() },
    },
    select: { userId: true, typeConsentement: true, expiresAt: true },
  }) as unknown as Promise<Array<{ userId: string; typeConsentement: string; expiresAt: Date }>>;
}

/**
 * Middleware de garde : lance une erreur si le consentement requis est absent.
 * À utiliser avant chaque traitement de données sensibles.
 *
 * @example
 * await requireConsent(userId, 'SCORING');
 */
export async function requireConsent(
  userId: string,
  type: ConsentType
): Promise<void> {
  const result = await checkConsent(userId, type);
  if (!result.granted) {
    throw new ConsentRequiredError(type, result.reason);
  }
}

// ─── Log Privacy Event ────────────────────────────────────────────────────────

export type PrivacyEventType =
  | "CONSENT_GRANTED" | "CONSENT_REVOKED" | "DATA_ACCESSED"
  | "DATA_EXPORTED" | "DATA_DELETED" | "DATA_ANONYMIZED"
  | "BREACH_DETECTED" | "SUSPICIOUS_ACCESS" | "RIGHT_EXERCISED"
  | "POLICY_UPDATED" | "RETENTION_PURGE";

export type PrivacySeverity = "INFO" | "WARNING" | "CRITICAL";

export interface LogPrivacyEventInput {
  userId?: string;
  eventType: PrivacyEventType;
  severity?: PrivacySeverity;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Écrit un événement dans le log dédié vie privée.
 * Séparé des audit_logs métier pour faciliter les rapports DPO.
 * Fire-and-forget — ne lève jamais d'exception.
 */
export async function logPrivacyEvent(input: LogPrivacyEventInput): Promise<void> {
  try {
    await prisma.privacyEventLog.create({
      data: {
        userId: input.userId ?? null,
        eventType: input.eventType,
        severity: input.severity ?? "INFO",
        resource: input.resource ?? null,
        details: input.details ?? undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ? input.userAgent.substring(0, 500) : null,
      },
    });
  } catch (err) {
    console.error("[PrivacyEventLog] Failed to write privacy event:", err);
  }
}

// ─── Erreurs ──────────────────────────────────────────────────────────────────

export class ConsentRequiredError extends Error {
  constructor(
    public readonly consentType: ConsentType,
    public readonly reason: string
  ) {
    super(
      `Consentement requis : "${consentType}" — Raison: ${reason}. ` +
        `L'utilisateur doit accepter ce traitement dans son Centre de Confidentialité.`
    );
    this.name = "ConsentRequiredError";
  }
}
