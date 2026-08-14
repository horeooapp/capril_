/**
 * PRIVACY BY DESIGN — Principe 5 : End-to-End Security
 * Chiffrement AES-256-GCM des données ultra-sensibles en base.
 *
 * Protège les champs RESTRICTED : numéros de pièces d'identité, données MRZ,
 * numéros de comptes bancaires.
 *
 * Utilise l'API Web Crypto (compatible Node.js 18+ et Edge Runtime).
 * La clé de chiffrement est stockée dans les variables d'environnement
 * (jamais en base de données).
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12;   // bytes (96 bits recommandé pour AES-GCM)
const TAG_LENGTH = 128; // bits

/**
 * Format de stockage chiffré.
 * Stocké en base sous forme JSON sérialisé : {"iv":"...","ct":"...","v":1}
 */
export interface EncryptedField {
  /** Vecteur d'initialisation (base64) */
  iv: string;
  /** Ciphertext (base64) */
  ct: string;
  /** Version de la clé (pour la rotation) */
  v: number;
}

// ─── Gestion de la clé ────────────────────────────────────────────────────────

let _cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey;

  const rawKeyB64 = process.env.FIELD_ENCRYPTION_KEY;
  if (!rawKeyB64) {
    throw new Error(
      "[Encryption] FIELD_ENCRYPTION_KEY is not set. " +
        "Generate one with: openssl rand -base64 32"
    );
  }

  const rawKey = Buffer.from(rawKeyB64, "base64");
  if (rawKey.length !== 32) {
    throw new Error(
      "[Encryption] FIELD_ENCRYPTION_KEY must be exactly 32 bytes (256 bits). " +
        `Got ${rawKey.length} bytes.`
    );
  }

  _cachedKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // non-extractable
    ["encrypt", "decrypt"]
  );

  return _cachedKey;
}

// ─── Chiffrement ──────────────────────────────────────────────────────────────

/**
 * Chiffre une valeur sensible avec AES-256-GCM.
 * Retourne un objet JSON sérialisé prêt pour le stockage en base.
 *
 * @example
 * const encrypted = await encryptField("CI0012345678");
 * // → '{"iv":"abc123","ct":"xyz789","v":1}'
 */
export async function encryptField(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext;

  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encoder.encode(plaintext)
  );

  const encrypted: EncryptedField = {
    iv: Buffer.from(iv).toString("base64"),
    ct: Buffer.from(ciphertext).toString("base64"),
    v: 1, // version actuelle de la clé
  };

  return JSON.stringify(encrypted);
}

/**
 * Déchiffre une valeur chiffrée par encryptField.
 * Log l'accès dans le privacy event log (principe de traçabilité).
 *
 * @example
 * const plain = await decryptField(encryptedJsonString);
 * // → "CI0012345678"
 */
export async function decryptField(encryptedJson: string): Promise<string> {
  if (!encryptedJson) return encryptedJson;

  // Si le champ n'est pas chiffré (données legacy), retourner tel quel
  if (!encryptedJson.startsWith("{")) return encryptedJson;

  let parsed: EncryptedField;
  try {
    parsed = JSON.parse(encryptedJson) as EncryptedField;
  } catch {
    // Donnée non chiffrée (legacy) — retourner brut
    return encryptedJson;
  }

  const key = await getEncryptionKey();
  const iv = Buffer.from(parsed.iv, "base64");
  const ciphertext = Buffer.from(parsed.ct, "base64");

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Chiffre un objet JSON (pour les champs metadata sensibles).
 */
export async function encryptObject<T>(obj: T): Promise<string> {
  return encryptField(JSON.stringify(obj));
}

/**
 * Déchiffre un objet JSON.
 */
export async function decryptObject<T>(encryptedJson: string): Promise<T> {
  const plaintext = await decryptField(encryptedJson);
  return JSON.parse(plaintext) as T;
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/**
 * Vérifie si une valeur est actuellement chiffrée.
 */
export function isEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && "iv" in parsed && "ct" in parsed && "v" in parsed;
  } catch {
    return false;
  }
}

/**
 * Hache une valeur sensible de façon irréversible (pour la recherche par correspondance exacte).
 * Utilisé pour docNumberHash : on peut chercher sans déchiffrer.
 *
 * @example
 * const hash = await hashForSearch("CI0012345678");
 * // Stocker ce hash pour les recherches, chiffrer la valeur réelle séparément.
 */
export async function hashForSearch(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env.SEARCH_HASH_SALT || "qapril-privacy-salt-2024";
  const data = encoder.encode(salt + value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

/**
 * Génère une clé de chiffrement sécurisée (pour setup initial).
 * Usage : node -e "require('./src/lib/encryption').generateNewKey().then(console.log)"
 */
export async function generateNewKey(): Promise<string> {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(key).toString("base64");
}
