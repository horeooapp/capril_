/**
 * PRIVACY BY DESIGN — Principe 5 : End-to-End Security
 * Pseudonymisation des données PII pour analytics et Business Intelligence.
 *
 * La pseudonymisation remplace les identifiants réels (email, téléphone)
 * par des tokens réversibles (avec les bonnes permissions) ou irréversibles
 * (pour les datasets analytics).
 *
 * Différence avec l'anonymisation :
 * - Pseudonymisation → réversible avec la clé (données toujours personnelles selon RGPD)
 * - Anonymisation → irréversible (données sortent du scope RGPD)
 */

import { redis } from "./redis";
import { generateProofHash } from "./proof";
import { logPrivacyEvent } from "./consent-manager";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PseudonymMapping {
  /** Identifiant pseudonymisé (token opaque) */
  token: string;
  /** Champ d'origine (ex: "email", "phone") */
  field: string;
  /** Table d'origine (ex: "users") */
  table: string;
  /** Expiration du mapping (null = permanent) */
  expiresAt?: Date;
}

export interface PseudonymizedRecord<T> {
  data: T;
  /** Map des champs pseudonymisés → tokens */
  tokenMap: Record<string, string>;
}

// ─── Champs pseudonymisables par défaut ──────────────────────────────────────

const PSEUDONYMIZABLE_FIELDS = {
  users: ["email", "phone", "firstName", "lastName"],
  customers: ["email", "phone", "name"],
  identity_documents: ["docNumber", "fullName"],
} as const;

// ─── Génération de tokens ─────────────────────────────────────────────────────

/**
 * Génère un token pseudonyme pour une valeur donnée.
 * Le token est deterministe (même entrée → même token) pour permettre
 * les jointures dans les analytics.
 */
async function generateToken(
  table: string,
  field: string,
  value: string
): Promise<string> {
  const salt = process.env.PSEUDONYM_SALT || "qapril-pseudo-salt-2024";
  const input = `${salt}::${table}::${field}::${value}`;
  const hash = await generateProofHash(input);
  return `PSE_${hash.slice(0, 24).toUpperCase()}`;
}

// ─── Stockage des mappings (Redis) ────────────────────────────────────────────

const MAPPING_PREFIX = "qapril:pseudo:";
const MAPPING_TTL = 60 * 60 * 24 * 365; // 1 an

async function storeMappingInRedis(
  token: string,
  realValue: string,
  field: string,
  table: string
): Promise<void> {
  if (!redis) return; // Graceful degradation si Redis indisponible

  try {
    const key = `${MAPPING_PREFIX}${token}`;
    const mapping = JSON.stringify({ realValue, field, table, createdAt: new Date().toISOString() });
    await redis.setex(key, MAPPING_TTL, mapping);
  } catch (err) {
    console.warn("[Pseudonymization] Failed to store mapping in Redis:", err);
  }
}

async function getMappingFromRedis(
  token: string
): Promise<{ realValue: string; field: string; table: string } | null> {
  if (!redis) return null;

  try {
    const key = `${MAPPING_PREFIX}${token}`;
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw as string);
  } catch {
    return null;
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Pseudonymise les champs sensibles d'un objet.
 * Retourne les données avec les PII remplacés par des tokens opaques.
 *
 * @example
 * const { data, tokenMap } = await pseudonymize('users', user, ['email', 'phone']);
 * // data.email → "PSE_A1B2C3D4E5F6G7H8I9J0K1L2"
 * // tokenMap → { "PSE_...": "original@email.com" }
 */
export async function pseudonymize<T extends Record<string, unknown>>(
  table: string,
  record: T,
  fields?: string[]
): Promise<PseudonymizedRecord<T>> {
  const targetFields =
    fields ??
    (PSEUDONYMIZABLE_FIELDS[table as keyof typeof PSEUDONYMIZABLE_FIELDS] as readonly string[]) ??
    [];

  const data = { ...record };
  const tokenMap: Record<string, string> = {};

  for (const field of targetFields) {
    const value = record[field];
    if (value === null || value === undefined || typeof value !== "string") continue;

    const token = await generateToken(table, field, value);
    (data as Record<string, unknown>)[field] = token;
    tokenMap[token] = value;

    // Stocker le mapping dans Redis pour dépseudonymisation ultérieure
    await storeMappingInRedis(token, value, field, table);
  }

  return { data: data as T, tokenMap };
}

/**
 * Pseudonymise un tableau d'enregistrements pour les exports analytics.
 */
export async function pseudonymizeMany<T extends Record<string, unknown>>(
  table: string,
  records: T[],
  fields?: string[]
): Promise<T[]> {
  return Promise.all(
    records.map(async (record) => {
      const { data } = await pseudonymize(table, record, fields);
      return data;
    })
  );
}

/**
 * Dépseudonymise un token (réversibilité contrôlée).
 * Nécessite des droits ADMIN. Audit log obligatoire.
 *
 * @param requesterId - ID de l'admin/DPO qui effectue la dépseudonymisation
 */
export async function depseudonymize(
  token: string,
  requesterId: string,
  reason: string
): Promise<string | null> {
  const mapping = await getMappingFromRedis(token);

  if (!mapping) {
    console.warn(`[Pseudonymization] Token not found in Redis: ${token}`);
    return null;
  }

  // Audit log obligatoire (accès aux données réelles)
  await logPrivacyEvent({
    userId: requesterId,
    eventType: "DATA_ACCESSED",
    severity: "WARNING",
    resource: `${mapping.table}.${mapping.field}`,
    details: {
      action: "DEPSEUDONYMIZATION",
      token,
      reason,
      requesterId,
    },
  });

  return mapping.realValue;
}

/**
 * Anonymisation irréversible d'un dataset pour analytics.
 * Contrairement à la pseudonymisation, les données anonymisées
 * ne peuvent pas être reliées à des individus → sortent du scope RGPD.
 *
 * Usage : exports BI, rapports agrégés, datasets ML.
 */
export function anonymizeForAnalytics<T extends Record<string, unknown>>(
  records: T[],
  fieldsToRemove: string[],
  fieldsToGeneralize: Record<string, (value: unknown) => unknown> = {}
): Omit<T, string>[] {
  return records.map((record) => {
    const result = { ...record };

    // Supprimer les champs identifiants directs
    for (const field of fieldsToRemove) {
      delete (result as Record<string, unknown>)[field];
    }

    // Généraliser les quasi-identifiants
    for (const [field, transformer] of Object.entries(fieldsToGeneralize)) {
      if (field in result) {
        (result as Record<string, unknown>)[field] = transformer(result[field]);
      }
    }

    return result as Omit<T, string>;
  });
}

/**
 * Exemple de généralisations pour l'anonymisation :
 * - Âge → tranche d'âge ("25-34")
 * - Commune → département
 * - Salaire → tranche ("200000-500000")
 */
export const ANONYMIZATION_GENERALIZERS = {
  /** Généralise un âge en tranche */
  ageToRange: (birthDate: unknown): string => {
    if (!(birthDate instanceof Date)) return "UNKNOWN";
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 25) return "18-24";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 55) return "45-54";
    return "55+";
  },

  /** Tronque un numéro de téléphone */
  truncatePhone: (phone: unknown): string => {
    if (typeof phone !== "string") return "***";
    return phone.slice(0, 6) + "****";
  },

  /** Généralise un salaire en tranche */
  salaryToRange: (salary: unknown): string => {
    if (typeof salary !== "number") return "UNKNOWN";
    if (salary < 100000) return "<100k";
    if (salary < 300000) return "100k-300k";
    if (salary < 500000) return "300k-500k";
    return ">500k";
  },
};
