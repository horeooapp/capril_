/**
 * PRIVACY BY DESIGN — Principe 4 : Full Functionality
 * Minimisation des données : n'exposer que le strict nécessaire selon le rôle.
 *
 * Implémente le principe OWASP API3 (Excessive Data Exposure) prevention.
 * Chaque rôle a une "vue" limitée sur les données utilisateur.
 */

import { Role } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataScope = "PUBLIC" | "INTERNAL" | "AGENT" | "MANAGER" | "ADMIN" | "SELF";

// ─── Sélecteurs Prisma par rôle ───────────────────────────────────────────────
// Chaque objet définit les champs autorisés pour une requête Prisma `select`.
// "true" = exposé, "false" ou absent = masqué.

/** Vue publique : informations minimales (profil public) */
export const USER_SELECT_PUBLIC = {
  id: true,
  firstName: true,
  avatarUrl: true,
  role: true,
  profileVisibility: true,
} as const;

/** Vue interne : pour les agents/agences partenaires */
export const USER_SELECT_INTERNAL = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  profileVisibility: true,
  kycLevel: true,
  createdAt: true,
} as const;

/** Vue agent : pour les agents immobiliers qui gèrent le dossier */
export const USER_SELECT_AGENT = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  role: true,
  status: true,
  kycLevel: true,
  kycStatus: true,
  isCertified: true,
  profession: true,
  neighborhood: true,
  preferredLang: true,
  createdAt: true,
} as const;

/** Vue manager : gestion opérationnelle */
export const USER_SELECT_MANAGER = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  role: true,
  status: true,
  kycLevel: true,
  kycStatus: true,
  isCertified: true,
  profession: true,
  salary: true,
  birthDate: true,
  birthPlace: true,
  neighborhood: true,
  preferredLang: true,
  activePlanTier: true,
  planExpiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Vue propriétaire (self) : l'utilisateur voit ses propres données */
export const USER_SELECT_SELF = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  birthDate: true,
  birthPlace: true,
  neighborhood: true,
  avatarUrl: true,
  role: true,
  profileType: true,
  kycLevel: true,
  kycStatus: true,
  isCertified: true,
  onboardingComplete: true,
  preferredLang: true,
  notificationPrefs: true,
  companyRegNumber: true,
  taxId: true,
  activePlanTier: true,
  planExpiresAt: true,
  status: true,
  emailVerified: true,
  profession: true,
  salary: true,
  // Privacy fields
  dataSharingConsent: true,
  marketingConsent: true,
  profileVisibility: true,
  anonymizedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Vue admin : accès complet (audit log obligatoire à chaque usage) */
export const USER_SELECT_ADMIN = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  birthDate: true,
  birthPlace: true,
  neighborhood: true,
  avatarUrl: true,
  role: true,
  profileType: true,
  kycLevel: true,
  kycStatus: true,
  password: false, // Le mot de passe ne doit JAMAIS être sélectionné
  isCertified: true,
  onboardingComplete: true,
  preferredLang: true,
  notificationPrefs: true,
  companyRegNumber: true,
  taxId: true,
  activePlanTier: true,
  planExpiresAt: true,
  status: true,
  emailVerified: true,
  emailVerifiedAt: true,
  profession: true,
  salary: true,
  dataSharingConsent: true,
  marketingConsent: true,
  profileVisibility: true,
  anonymizedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

// ─── Mapping rôle → sélecteur ─────────────────────────────────────────────────

type PrismaUserSelect = Record<string, boolean>;

/**
 * Retourne le sélecteur Prisma approprié selon le rôle demandeur.
 * Utilise toujours le principe du moindre privilège.
 *
 * @example
 * const users = await prisma.user.findMany({
 *   select: getUserSelectForRole('AGENT'),
 * });
 */
export function getUserSelectForRole(
  role: Role | "SELF" | "PUBLIC",
  options: { isOwnData?: boolean } = {}
): PrismaUserSelect {
  if (options.isOwnData) return USER_SELECT_SELF as unknown as PrismaUserSelect;

  switch (role) {
    case "SUPER_ADMIN":
      return USER_SELECT_ADMIN as unknown as PrismaUserSelect;
    case "MANAGER":
      return USER_SELECT_MANAGER as unknown as PrismaUserSelect;
    case "AGENT":
    case "TENANT":
      return USER_SELECT_AGENT as unknown as PrismaUserSelect;
    case "PUBLIC":
      return USER_SELECT_PUBLIC as unknown as PrismaUserSelect;
    default:
      return USER_SELECT_INTERNAL as unknown as PrismaUserSelect;
  }
}

// ─── Minimisation pour les réponses API ──────────────────────────────────────

/**
 * Champs sensibles à ne JAMAIS exposer dans une réponse API,
 * même pour les admins (défense en profondeur).
 */
export const NEVER_EXPOSE_FIELDS = [
  "password",
  "pushToken",
  "maposteId",
] as const;

/**
 * Nettoie un objet pour s'assurer qu'aucun champ interdit n'est exposé.
 * À utiliser sur toutes les réponses API contenant des données utilisateur.
 */
export function sanitizeForApi<T extends Record<string, unknown>>(data: T): Omit<T, typeof NEVER_EXPOSE_FIELDS[number]> {
  const result = { ...data };
  for (const field of NEVER_EXPOSE_FIELDS) {
    delete result[field as string];
  }
  return result as Omit<T, typeof NEVER_EXPOSE_FIELDS[number]>;
}

/**
 * Applique la minimisation à un tableau de résultats.
 */
export function sanitizeArrayForApi<T extends Record<string, unknown>>(
  items: T[]
): Array<Omit<T, typeof NEVER_EXPOSE_FIELDS[number]>> {
  return items.map(sanitizeForApi);
}

// ─── Sélecteurs pour autres modèles ──────────────────────────────────────────

/** Sélecteur minimal pour IdentityDocument (évite d'exposer les scans et MRZ) */
export const IDENTITY_DOC_SELECT_AGENT = {
  id: true,
  docType: true,
  fullName: true,
  nationality: true,
  issuingCountry: true,
  expiryDate: true,
  status: true,
  verifiedAt: true,
  // Champs RESTRICTED exclus : docNumber, mrzRawData, scanS3Key
} as const;

/** Pour les admins : accès complet aux documents (audit obligatoire) */
export const IDENTITY_DOC_SELECT_ADMIN = {
  id: true,
  docType: true,
  docNumber: true,
  fullName: true,
  birthDate: true,
  nationality: true,
  issuingCountry: true,
  expiryDate: true,
  status: true,
  verifiedAt: true,
  // mrzRawData et scanS3Key exclus par défaut même pour les admins
  // → demander via endpoint dédié avec audit log renforcé
} as const;
