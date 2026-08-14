"use server";

/**
 * PRIVACY BY DESIGN — Principe 6 & 7 : Transparence + Respect de la vie privée
 * Server Actions sécurisées pour l'exercice des droits RGPD.
 *
 * Ces actions sont appelables depuis les composants React côté client.
 * Chaque action vérifie la session active et l'appartenance des données.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  grantConsent,
  revokeConsent,
  listActiveConsents,
  getConsentHistory,
  logPrivacyEvent,
  type ConsentType,
  type ConsentSource,
} from "@/lib/consent-manager";
import { anonymizeUser } from "@/lib/data-retention";
import { checkDataExportAccess } from "@/lib/privacy-monitor";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Utilitaires internes ─────────────────────────────────────────────────────

async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  return session;
}

async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
}

async function getUserAgent(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("user-agent") ?? "unknown";
}

// ─── Actions de consentement ──────────────────────────────────────────────────

/**
 * Accorde un consentement depuis l'interface utilisateur.
 */
export async function grantConsentAction(
  type: ConsentType,
  source: ConsentSource = "WEB"
): Promise<ActionResult> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;
    const ipAddress = await getClientIp();
    const userAgent = await getUserAgent();

    await grantConsent({ userId, type, source, ipAddress, userAgent });

    return { success: true };
  } catch (err) {
    console.error("[PrivacyAction] grantConsent failed:", err);
    return { success: false, error: "Impossible d'enregistrer le consentement." };
  }
}

/**
 * Révoque un consentement depuis l'interface utilisateur.
 */
export async function revokeConsentAction(
  type: ConsentType
): Promise<ActionResult> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;
    const ipAddress = await getClientIp();

    await revokeConsent(userId, type, ipAddress);

    return { success: true };
  } catch (err) {
    console.error("[PrivacyAction] revokeConsent failed:", err);
    return { success: false, error: "Impossible de révoquer le consentement." };
  }
}

/**
 * Retourne les consentements actifs de l'utilisateur connecté.
 */
export async function getMyConsentsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listActiveConsents>>>
> {
  try {
    const session = await getSessionOrThrow();
    const data = await listActiveConsents(session.user!.id!);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Impossible de récupérer les consentements." };
  }
}

/**
 * Retourne l'historique complet des consentements.
 */
export async function getConsentHistoryAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getConsentHistory>>>
> {
  try {
    const session = await getSessionOrThrow();
    const data = await getConsentHistory(session.user!.id!);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Impossible de récupérer l'historique." };
  }
}

// ─── Actions d'exercice des droits RGPD ──────────────────────────────────────

export type PrivacyRequestType =
  | "ACCESS"
  | "RECTIFICATION"
  | "ERASURE"
  | "PORTABILITY"
  | "OBJECTION"
  | "RESTRICTION"
  | "WITHDRAWAL";

/**
 * Soumet une demande d'exercice des droits RGPD.
 * Le délai de réponse légal est de 30 jours (RGPD) / 15 jours (loi ivoirienne).
 */
export async function submitPrivacyRequestAction(
  type: PrivacyRequestType,
  description?: string
): Promise<ActionResult<{ requestId: string; dueAt: Date }>> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;
    const ipAddress = await getClientIp();

    // Délai légal : 30 jours RGPD
    const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const request = await prisma.privacyRequest.create({
      data: {
        userId,
        type,
        status: "PENDING",
        description: description ?? null,
        dueAt,
        ipAddress,
      },
    });

    await logPrivacyEvent({
      userId,
      eventType: "RIGHT_EXERCISED",
      severity: "INFO",
      resource: `privacy_request.${type}`,
      details: { requestId: request.id, type, dueAt: dueAt.toISOString() },
      ipAddress,
    });

    // TODO: Notifier le DPO par email

    return {
      success: true,
      data: { requestId: request.id, dueAt },
    };
  } catch (err) {
    console.error("[PrivacyAction] submitPrivacyRequest failed:", err);
    return {
      success: false,
      error: "Impossible de soumettre la demande. Veuillez réessayer.",
    };
  }
}

/**
 * Retourne les demandes d'exercice des droits de l'utilisateur connecté.
 */
export async function getMyPrivacyRequestsAction(): Promise<
  ActionResult<Array<{
    id: string;
    type: string;
    status: string;
    requestedAt: Date;
    dueAt: Date;
    completedAt: Date | null;
    exportUrl: string | null;
    rejectionReason: string | null;
  }>>
> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;

    const requests = await prisma.privacyRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        requestedAt: true,
        dueAt: true,
        completedAt: true,
        exportUrl: true,
        rejectionReason: true,
      },
    });

    return { success: true, data: requests };
  } catch (err) {
    return { success: false, error: "Impossible de récupérer vos demandes." };
  }
}

/**
 * Initie l'anonymisation du compte (droit à l'oubli).
 * Cette action est irréversible — nécessite une confirmation explicite.
 *
 * @param confirmationPhrase - L'utilisateur doit taper "SUPPRIMER MON COMPTE" pour confirmer
 */
export async function requestAccountAnonymizationAction(
  confirmationPhrase: string
): Promise<ActionResult<{ proofHash: string }>> {
  if (confirmationPhrase.trim().toUpperCase() !== "SUPPRIMER MON COMPTE") {
    return {
      success: false,
      error: "Phrase de confirmation incorrecte. Tapez exactement : SUPPRIMER MON COMPTE",
    };
  }

  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;

    // Vérifier qu'il n'existe pas de demande en cours
    const existing = await prisma.privacyRequest.findFirst({
      where: { userId, type: "ERASURE", status: { in: ["PENDING", "IN_PROGRESS"] } },
    });

    if (existing) {
      return {
        success: false,
        error: "Une demande de suppression est déjà en cours de traitement.",
      };
    }

    // Créer la demande formelle
    await prisma.privacyRequest.create({
      data: {
        userId,
        type: "ERASURE",
        status: "IN_PROGRESS",
        description: "Demande de suppression initiée par l'utilisateur",
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Exécuter l'anonymisation
    const result = await anonymizeUser(userId);

    if (!result.success) {
      return { success: false, error: result.reason ?? "Anonymisation échouée." };
    }

    return { success: true, data: { proofHash: result.proofHash } };
  } catch (err) {
    console.error("[PrivacyAction] anonymizeAccount failed:", err);
    return { success: false, error: "Erreur lors de la suppression du compte." };
  }
}

/**
 * Déclenche un export de données personnelles (droit à la portabilité).
 * Rate-limité à 1 export par 24h pour prévenir les abus.
 */
export async function requestDataExportAction(): Promise<
  ActionResult<{ requestId: string }>
> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;

    // Vérification du rate limit
    const accessCheck = await checkDataExportAccess(userId);
    if (!accessCheck.allowed) {
      return {
        success: false,
        error: `Limite atteinte : maximum ${accessCheck.threshold} exports par 24h.`,
      };
    }

    const request = await prisma.privacyRequest.create({
      data: {
        userId,
        type: "PORTABILITY",
        status: "IN_PROGRESS",
        description: "Export de données initié par l'utilisateur",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h pour portabilité
      },
    });

    // TODO: Déclencher le job d'export asynchrone (BullMQ)
    // await exportQueue.add('user-data-export', { userId, requestId: request.id });

    return { success: true, data: { requestId: request.id } };
  } catch (err) {
    console.error("[PrivacyAction] requestDataExport failed:", err);
    return { success: false, error: "Impossible de déclencher l'export." };
  }
}

/**
 * Met à jour les préférences de confidentialité de l'utilisateur.
 */
export async function updatePrivacyPreferencesAction(prefs: {
  marketingConsent?: boolean;
  dataSharingConsent?: boolean;
  profileVisibility?: "PRIVATE" | "INTERNAL" | "PUBLIC";
}): Promise<ActionResult> {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user!.id!;
    const ipAddress = await getClientIp();

    // Mettre à jour les colonnes privacy sur l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        marketingConsent: prefs.marketingConsent,
        dataSharingConsent: prefs.dataSharingConsent,
        profileVisibility: prefs.profileVisibility,
      },
    });

    // Synchroniser avec la table des consentements
    if (prefs.marketingConsent !== undefined) {
      if (prefs.marketingConsent) {
        await grantConsent({ userId, type: "MARKETING", ipAddress });
      } else {
        await revokeConsent(userId, "MARKETING", ipAddress);
      }
    }

    if (prefs.dataSharingConsent !== undefined) {
      if (prefs.dataSharingConsent) {
        await grantConsent({ userId, type: "DATA_SHARING", ipAddress });
      } else {
        await revokeConsent(userId, "DATA_SHARING", ipAddress);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[PrivacyAction] updatePrivacyPreferences failed:", err);
    return { success: false, error: "Impossible de mettre à jour les préférences." };
  }
}
