/**
 * PRIVACY BY DESIGN — Principe 5 : End-to-End Security
 * Moteur de rétention et d'anonymisation des données personnelles.
 *
 * Gère :
 * - Les politiques de rétention par type de donnée
 * - L'anonymisation irréversible (droit à l'oubli — RGPD Art. 17)
 * - La purge planifiée des données expirées
 * - Le nettoyage des sessions, OTP et tokens
 */

import { prisma } from "./prisma";
import { logPrivacyEvent } from "./consent-manager";
import { generateProofHash } from "./proof";

// ─── Politiques de rétention ──────────────────────────────────────────────────

/** Durées de rétention en jours */
export const RETENTION_POLICIES = {
  // Logs & audit (obligation légale)
  AUDIT_LOG_PAYMENT:    365 * 5,   // 5 ans — obligation comptable
  AUDIT_LOG_AUTH:       365,        // 1 an — traçabilité sécurité
  AUDIT_LOG_GENERAL:    365,        // 1 an

  // Privacy logs
  PRIVACY_EVENT_LOG:    365 * 3,   // 3 ans — preuve de conformité

  // Sessions & tokens
  USER_SESSION:         30,         // 30 jours
  OTP_CODES:            1,          // 24 heures
  EMAIL_VERIF_TOKENS:   7,          // 7 jours
  REFRESH_TOKENS:       30,         // 30 jours

  // Documents & KYC
  IDENTITY_DOCUMENTS:   365,        // 1 an après fin de relation
  SCAN_EXTRACTIONS:     365,        // 1 an

  // Activités métier
  SCORING_HISTORY:      365 * 3,   // 3 ans
  NOTIFICATION_LOGS:    90,         // 3 mois
  WEBHOOK_EVENTS:       90,         // 3 mois
  ICL_EVENTS:           365 * 2,   // 2 ans

  // WA sessions
  WA_SESSIONS:          30,         // 30 jours
} as const;

// ─── Tokens d'anonymisation ───────────────────────────────────────────────────

const ANONYMIZED_FIRST_NAME = "[Utilisateur supprimé]";
const ANONYMIZED_LAST_NAME  = "";
const ANONYMIZED_EMAIL_TPL  = (id: string) => `anonymized-${id.slice(0, 8)}@deleted.local`;
const ANONYMIZED_PHONE_TPL  = (id: string) => `+00000000${id.slice(0, 4)}`;

// ─── Anonymisation utilisateur (Droit à l'oubli) ─────────────────────────────

export interface AnonymizationResult {
  success: boolean;
  userId: string;
  fieldsAnonymized: string[];
  reason?: string;
  proofHash: string;
}

/**
 * Anonymise irréversiblement les données personnelles d'un utilisateur.
 * Respecte les exceptions légales : les données requises par obligation légale
 * (paiements, baux signés) sont conservées sous forme anonymisée.
 *
 * Cette fonction implémente le "Droit à l'oubli" (RGPD Art. 17).
 */
export async function anonymizeUser(
  userId: string,
  requestedByAdminId?: string
): Promise<AnonymizationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phone: true, anonymizedAt: true, deletedAt: true },
  });

  if (!user) {
    return { success: false, userId, fieldsAnonymized: [], reason: "USER_NOT_FOUND", proofHash: "" };
  }

  if (user.anonymizedAt) {
    return { success: false, userId, fieldsAnonymized: [], reason: "ALREADY_ANONYMIZED", proofHash: "" };
  }

  const fieldsAnonymized: string[] = [];

  try {
    // 1. Anonymiser les données PII de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName:    ANONYMIZED_FIRST_NAME,
        lastName:     ANONYMIZED_LAST_NAME,
        email:        ANONYMIZED_EMAIL_TPL(userId),
        phone:        ANONYMIZED_PHONE_TPL(userId),
        birthDate:    null,
        birthPlace:   null,
        neighborhood: null,
        avatarUrl:    null,
        salary:       null,
        profession:   null,
        pushToken:    null,
        maposteId:    null,
        taxId:        null,
        companyRegNumber: null,
        anonymizedAt: new Date(),
        deletedAt:    new Date(),
        // Révoquer tous les consentements
        dataSharingConsent: false,
        marketingConsent:   false,
      },
    });

    fieldsAnonymized.push(
      "firstName", "lastName", "email", "phone",
      "birthDate", "birthPlace", "neighborhood", "avatarUrl",
      "salary", "profession", "pushToken", "taxId"
    );

    // 2. Soft-delete et anonymisation des documents d'identité
    await prisma.identityDocument.updateMany({
      where: { userId },
      data: {
        docNumber:   "ANONYMIZED",
        mrzRawData:  null,
        scanS3Key:   null,
        fullName:    "Données supprimées",
        birthDate:   null,
        metadata:    undefined,
      },
    });
    fieldsAnonymized.push("identity_documents.*");

    // 3. Révoquer tous les consentements
    await prisma.userConsent.updateMany({
      where: { userId, granted: true, revokedAt: null },
      data: { granted: false, revokedAt: new Date() },
    });
    fieldsAnonymized.push("user_consents (all revoked)");

    // 4. Générer une preuve cryptographique de l'anonymisation
    const proofData = {
      userId,
      action: "ANONYMIZE_USER",
      timestamp: new Date().toISOString(),
      requestedByAdminId: requestedByAdminId ?? "USER_SELF",
      fieldsAnonymized,
    };
    const proofHash = await generateProofHash(proofData);

    // 5. Log privacy de l'anonymisation
    await logPrivacyEvent({
      userId,
      eventType: "DATA_ANONYMIZED",
      severity: "WARNING",
      resource: "users",
      details: {
        ...proofData,
        proofHash,
      },
    });

    return { success: true, userId, fieldsAnonymized, proofHash };
  } catch (err) {
    console.error("[DataRetention] Anonymization failed:", err);
    return {
      success: false,
      userId,
      fieldsAnonymized,
      reason: `ERROR: ${err instanceof Error ? err.message : "Unknown"}`,
      proofHash: "",
    };
  }
}

// ─── Purge des données expirées ───────────────────────────────────────────────

/**
 * Purge les audit logs dépassant la durée de rétention légale.
 * À exécuter via un cron job quotidien (ex: 3h du matin).
 * Retourne le nombre de lignes supprimées.
 */
export async function purgeExpiredAuditLogs(): Promise<number> {
  const cutoff = new Date(
    Date.now() - RETENTION_POLICIES.AUDIT_LOG_GENERAL * 24 * 60 * 60 * 1000
  );

  // Exclure les logs de paiement (rétention 5 ans)
  const paymentCutoff = new Date(
    Date.now() - RETENTION_POLICIES.AUDIT_LOG_PAYMENT * 24 * 60 * 60 * 1000
  );

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoff },
      module: { notIn: ["PAYMENT", "RECEIPT", "M17_FISCAL"] },
    },
  });

  // Purge séparée des logs de paiement avec rétention étendue
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: paymentCutoff },
      module: { in: ["PAYMENT", "RECEIPT", "M17_FISCAL"] },
    },
  });

  if (deleted.count > 0) {
    await logPrivacyEvent({
      eventType: "RETENTION_PURGE",
      severity: "INFO",
      resource: "audit_log",
      details: { deletedCount: deleted.count, cutoffDate: cutoff.toISOString() },
    });
  }

  return deleted.count;
}

/**
 * Purge les logs de notification expirés.
 */
export async function purgeExpiredNotificationLogs(): Promise<number> {
  const cutoff = new Date(
    Date.now() - RETENTION_POLICIES.NOTIFICATION_LOGS * 24 * 60 * 60 * 1000
  );

  const deleted = await prisma.notificationLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return deleted.count;
}

/**
 * Purge les événements webhook anciens.
 */
export async function purgeExpiredWebhookEvents(): Promise<number> {
  const cutoff = new Date(
    Date.now() - RETENTION_POLICIES.WEBHOOK_EVENTS * 24 * 60 * 60 * 1000
  );

  const deleted = await prisma.webhookEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return deleted.count;
}

/**
 * Purge les sessions WA expirées.
 */
export async function purgeExpiredWaSessions(): Promise<number> {
  const cutoff = new Date(
    Date.now() - RETENTION_POLICIES.WA_SESSIONS * 24 * 60 * 60 * 1000
  );

  const deleted = await prisma.waSession.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return deleted.count;
}

/**
 * Purge les privacy event logs anciens.
 */
export async function purgeExpiredPrivacyLogs(): Promise<number> {
  const cutoff = new Date(
    Date.now() - RETENTION_POLICIES.PRIVACY_EVENT_LOG * 24 * 60 * 60 * 1000
  );

  const deleted = await prisma.privacyEventLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return deleted.count;
}

/**
 * Rapport de rétention : résume les données qui devront être purgées.
 * Utilisé par le DPO pour les rapports mensuels.
 */
export async function getRetentionReport(): Promise<{
  auditLogsToExpire: number;
  notifLogsToExpire: number;
  webhookEventsToExpire: number;
  waSessionsToExpire: number;
  reportGeneratedAt: string;
}> {
  const auditCutoff = new Date(Date.now() - RETENTION_POLICIES.AUDIT_LOG_GENERAL * 24 * 60 * 60 * 1000);
  const notifCutoff = new Date(Date.now() - RETENTION_POLICIES.NOTIFICATION_LOGS * 24 * 60 * 60 * 1000);
  const webhookCutoff = new Date(Date.now() - RETENTION_POLICIES.WEBHOOK_EVENTS * 24 * 60 * 60 * 1000);
  const waCutoff = new Date(Date.now() - RETENTION_POLICIES.WA_SESSIONS * 24 * 60 * 60 * 1000);

  const [auditCount, notifCount, webhookCount, waCount] = await Promise.all([
    prisma.auditLog.count({ where: { createdAt: { lt: auditCutoff } } }),
    prisma.notificationLog.count({ where: { createdAt: { lt: notifCutoff } } }),
    prisma.webhookEvent.count({ where: { createdAt: { lt: webhookCutoff } } }),
    prisma.waSession.count({ where: { createdAt: { lt: waCutoff } } }),
  ]);

  return {
    auditLogsToExpire:       auditCount,
    notifLogsToExpire:       notifCount,
    webhookEventsToExpire:   webhookCount,
    waSessionsToExpire:      waCount,
    reportGeneratedAt:       new Date().toISOString(),
  };
}

/**
 * Exécute toutes les purges de rétention.
 * Fonction principale appelée par le cron job quotidien.
 */
export async function runFullRetentionPurge(): Promise<{
  auditLogs: number;
  notifLogs: number;
  webhookEvents: number;
  waSessions: number;
  privacyLogs: number;
  executedAt: string;
}> {
  const [auditLogs, notifLogs, webhookEvents, waSessions, privacyLogs] =
    await Promise.all([
      purgeExpiredAuditLogs(),
      purgeExpiredNotificationLogs(),
      purgeExpiredWebhookEvents(),
      purgeExpiredWaSessions(),
      purgeExpiredPrivacyLogs(),
    ]);

  const result = {
    auditLogs,
    notifLogs,
    webhookEvents,
    waSessions,
    privacyLogs,
    executedAt: new Date().toISOString(),
  };

  console.info("[DataRetention] Full purge completed:", result);

  return result;
}
