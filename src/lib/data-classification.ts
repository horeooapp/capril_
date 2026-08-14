/**
 * PRIVACY BY DESIGN — Principe 3 : Privacy Embedded into Design
 * Classification des données personnelles + Minimisation
 *
 * Registre opérationnel des champs PII de l'application.
 * Chaque champ est classé selon sa sensibilité, sa base légale
 * et sa durée de rétention.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataSensitivity = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export type DataCategory =
  | "IDENTITY"      // Nom, prénom, date de naissance
  | "CONTACT"       // Téléphone, email, adresse
  | "FINANCIAL"     // Salaire, compte bancaire, loyer
  | "BEHAVIORAL"    // Historique d'utilisation, scoring
  | "LOCATION"      // GPS, adresse, commune
  | "BIOMETRIC"     // Photo, empreinte, MRZ
  | "LEGAL"         // Numéro de pièce, RCCM, NIF
  | "HEALTH"        // Données médicales (si applicable)
  | "TECHNICAL";    // IP, User-Agent, token session

export type LegalBasisCode =
  | "CONSENT"
  | "CONTRACT"
  | "LEGAL_OBLIGATION"
  | "LEGITIMATE_INTEREST"
  | "VITAL_INTEREST"
  | "PUBLIC_TASK";

export interface FieldClassification {
  /** Niveau de sensibilité */
  sensitivity: DataSensitivity;
  /** Catégorie RGPD */
  category: DataCategory;
  /** Base légale du traitement */
  legalBasis: LegalBasisCode;
  /** Durée de rétention (ex: "3Y", "30D", "1Y") */
  retention: string;
  /** Description lisible */
  description: string;
  /** Ce champ peut-il être inclus dans un export portabilité ? */
  portable: boolean;
  /** Ce champ doit-il être anonymisé à la suppression ? */
  anonymizeOnDelete: boolean;
}

// ─── Registre de classification des champs ───────────────────────────────────
// Format : "table.champ" → FieldClassification
// Ce registre sert de source unique de vérité pour les décisions de traitement.

export const DATA_FIELD_REGISTRY: Record<string, FieldClassification> = {
  // ── Utilisateur ──────────────────────────────────────────────────────────
  "users.firstName": {
    sensitivity: "INTERNAL", category: "IDENTITY",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Prénom de l'utilisateur",
    portable: true, anonymizeOnDelete: true,
  },
  "users.lastName": {
    sensitivity: "INTERNAL", category: "IDENTITY",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Nom de famille de l'utilisateur",
    portable: true, anonymizeOnDelete: true,
  },
  "users.phone": {
    sensitivity: "CONFIDENTIAL", category: "CONTACT",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Numéro de téléphone principal",
    portable: true, anonymizeOnDelete: true,
  },
  "users.email": {
    sensitivity: "CONFIDENTIAL", category: "CONTACT",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Adresse email",
    portable: true, anonymizeOnDelete: true,
  },
  "users.birthDate": {
    sensitivity: "CONFIDENTIAL", category: "IDENTITY",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Date de naissance",
    portable: true, anonymizeOnDelete: true,
  },
  "users.birthPlace": {
    sensitivity: "CONFIDENTIAL", category: "IDENTITY",
    legalBasis: "CONTRACT", retention: "3Y",
    description: "Lieu de naissance",
    portable: true, anonymizeOnDelete: true,
  },
  "users.salary": {
    sensitivity: "RESTRICTED", category: "FINANCIAL",
    legalBasis: "LEGAL_OBLIGATION", retention: "5Y",
    description: "Salaire mensuel déclaré",
    portable: true, anonymizeOnDelete: true,
  },
  "users.avatarUrl": {
    sensitivity: "INTERNAL", category: "BIOMETRIC",
    legalBasis: "CONSENT", retention: "3Y",
    description: "Photo de profil",
    portable: true, anonymizeOnDelete: true,
  },
  "users.pushToken": {
    sensitivity: "CONFIDENTIAL", category: "TECHNICAL",
    legalBasis: "CONSENT", retention: "30D",
    description: "Token de notification push",
    portable: false, anonymizeOnDelete: true,
  },

  // ── Documents d'identité ─────────────────────────────────────────────────
  "identity_documents.docNumber": {
    sensitivity: "RESTRICTED", category: "LEGAL",
    legalBasis: "LEGAL_OBLIGATION", retention: "1Y",
    description: "Numéro de pièce d'identité",
    portable: false, anonymizeOnDelete: true,
  },
  "identity_documents.mrzRawData": {
    sensitivity: "RESTRICTED", category: "BIOMETRIC",
    legalBasis: "LEGAL_OBLIGATION", retention: "1Y",
    description: "Données brutes MRZ du document",
    portable: false, anonymizeOnDelete: true,
  },
  "identity_documents.scanS3Key": {
    sensitivity: "RESTRICTED", category: "BIOMETRIC",
    legalBasis: "LEGAL_OBLIGATION", retention: "1Y",
    description: "Clé S3 du scan du document",
    portable: false, anonymizeOnDelete: true,
  },

  // ── Propriétés ───────────────────────────────────────────────────────────
  "properties.gpsLatitude": {
    sensitivity: "CONFIDENTIAL", category: "LOCATION",
    legalBasis: "LEGITIMATE_INTEREST", retention: "3Y",
    description: "Latitude GPS du bien",
    portable: true, anonymizeOnDelete: false,
  },
  "properties.gpsLongitude": {
    sensitivity: "CONFIDENTIAL", category: "LOCATION",
    legalBasis: "LEGITIMATE_INTEREST", retention: "3Y",
    description: "Longitude GPS du bien",
    portable: true, anonymizeOnDelete: false,
  },
  "properties.address": {
    sensitivity: "INTERNAL", category: "LOCATION",
    legalBasis: "CONTRACT", retention: "5Y",
    description: "Adresse complète du bien",
    portable: true, anonymizeOnDelete: false,
  },

  // ── Logs techniques ──────────────────────────────────────────────────────
  "audit_log.ipAddress": {
    sensitivity: "CONFIDENTIAL", category: "TECHNICAL",
    legalBasis: "LEGAL_OBLIGATION", retention: "1Y",
    description: "Adresse IP de l'action auditée",
    portable: false, anonymizeOnDelete: false,
  },
  "audit_log.userAgent": {
    sensitivity: "INTERNAL", category: "TECHNICAL",
    legalBasis: "LEGAL_OBLIGATION", retention: "1Y",
    description: "User-Agent du navigateur/app",
    portable: false, anonymizeOnDelete: false,
  },

  // ── Paiements ────────────────────────────────────────────────────────────
  "payment_pgw.phoneNumber": {
    sensitivity: "RESTRICTED", category: "FINANCIAL",
    legalBasis: "CONTRACT", retention: "5Y",
    description: "Numéro Mobile Money utilisé",
    portable: true, anonymizeOnDelete: true,
  },
};

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

/**
 * Retourne la classification d'un champ.
 * @param tableField - Format "table.champ" (ex: "users.phone")
 */
export function getFieldClassification(
  tableField: string
): FieldClassification | null {
  return DATA_FIELD_REGISTRY[tableField] ?? null;
}

/**
 * Retourne tous les champs d'une table avec leur niveau de sensibilité.
 */
export function getTableFields(
  tableName: string
): Record<string, FieldClassification> {
  return Object.fromEntries(
    Object.entries(DATA_FIELD_REGISTRY)
      .filter(([key]) => key.startsWith(`${tableName}.`))
      .map(([key, val]) => [key.split(".")[1], val])
  );
}

/**
 * Retourne tous les champs RESTRICTED de l'application.
 * Utilisé pour les audits DPO.
 */
export function getRestrictedFields(): Record<string, FieldClassification> {
  return Object.fromEntries(
    Object.entries(DATA_FIELD_REGISTRY).filter(
      ([, v]) => v.sensitivity === "RESTRICTED"
    )
  );
}

/**
 * Retourne tous les champs portables pour un export portabilité.
 */
export function getPortableFields(tableName: string): string[] {
  return Object.entries(DATA_FIELD_REGISTRY)
    .filter(([key, val]) => key.startsWith(`${tableName}.`) && val.portable)
    .map(([key]) => key.split(".")[1]);
}

/**
 * Masque les valeurs PII sensibles dans un objet (pour les logs).
 * Remplace la valeur par "***" selon la classification.
 */
export function maskSensitiveFields(
  tableName: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...data };
  for (const [field, value] of Object.entries(data)) {
    const key = `${tableName}.${field}`;
    const classification = DATA_FIELD_REGISTRY[key];
    if (
      classification &&
      (classification.sensitivity === "RESTRICTED" ||
        classification.sensitivity === "CONFIDENTIAL") &&
      value !== null &&
      value !== undefined
    ) {
      result[field] = "***MASKED***";
    }
  }
  return result;
}

/**
 * Génère un résumé du registre pour le rapport DPO (Art. 30 RGPD).
 */
export function generateDataInventorySummary(): {
  totalFields: number;
  byCategory: Record<DataCategory, number>;
  bySensitivity: Record<DataSensitivity, number>;
  portableFields: number;
  restrictedFields: string[];
} {
  const entries = Object.entries(DATA_FIELD_REGISTRY);
  const byCategory = {} as Record<DataCategory, number>;
  const bySensitivity = {} as Record<DataSensitivity, number>;

  for (const [, val] of entries) {
    byCategory[val.category] = (byCategory[val.category] ?? 0) + 1;
    bySensitivity[val.sensitivity] = (bySensitivity[val.sensitivity] ?? 0) + 1;
  }

  return {
    totalFields: entries.length,
    byCategory,
    bySensitivity,
    portableFields: entries.filter(([, v]) => v.portable).length,
    restrictedFields: entries
      .filter(([, v]) => v.sensitivity === "RESTRICTED")
      .map(([k]) => k),
  };
}
