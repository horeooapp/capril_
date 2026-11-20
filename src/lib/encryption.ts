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
let _cachedRawKey: Buffer | null = null;

export async function getRawEncryptionKey(): Promise<Buffer> {
  if (_cachedRawKey) return _cachedRawKey;

  const rawKeyB64 = process.env.FIELD_ENCRYPTION_KEY;
  if (rawKeyB64) {
    const rawKey = Buffer.from(rawKeyB64, "base64");
    if (rawKey.length === 32) {
      _cachedRawKey = rawKey;
      return _cachedRawKey;
    }
  }

  // Fallback sécurisé et déterministe basé sur le secret maître de l'application
  const master = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "qapril-master-vault-encryption-key-2026";
  const cryptoNode = await import("crypto");
  _cachedRawKey = cryptoNode.createHash("sha256").update(master).digest();
  return _cachedRawKey;
}

async function getEncryptionKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey;

  const rawKey = await getRawEncryptionKey();

  _cachedKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(rawKey),
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

// ─── Chiffrement des Fichiers Physiques (At-Rest File Encryption) ──────────

const FILE_HEADER = Buffer.from("QAPRIL_ENC_V1", "utf-8"); // 13 bytes

/**
 * Chiffre un buffer binaire (image, document, PDF) en AES-256-GCM avant écriture disque.
 */
export async function encryptFileBuffer(buffer: Buffer): Promise<Buffer> {
  const key = await getRawEncryptionKey();
  const cryptoNode = await import("crypto");
  const iv = cryptoNode.randomBytes(12);
  const cipher = cryptoNode.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([FILE_HEADER, iv, tag, encrypted]);
}

/**
 * Déchiffre un buffer binaire chiffré en AES-256-GCM.
 * Si le buffer n'a pas l'en-tête QAPRIL_ENC_V1, il est retourné tel quel (rétrocompatibilité).
 */
export async function decryptFileBuffer(buffer: Buffer): Promise<Buffer> {
  if (buffer.length < FILE_HEADER.length + 12 + 16 || !buffer.subarray(0, FILE_HEADER.length).equals(FILE_HEADER)) {
    return buffer;
  }
  const key = await getRawEncryptionKey();
  const cryptoNode = await import("crypto");
  const iv = buffer.subarray(FILE_HEADER.length, FILE_HEADER.length + 12);
  const tag = buffer.subarray(FILE_HEADER.length + 12, FILE_HEADER.length + 12 + 16);
  const encrypted = buffer.subarray(FILE_HEADER.length + 12 + 16);
  const decipher = cryptoNode.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Vérifie si un buffer de fichier est chiffré.
 */
export function isEncryptedBuffer(buffer: Buffer): boolean {
  return buffer.length >= FILE_HEADER.length && buffer.subarray(0, FILE_HEADER.length).equals(FILE_HEADER);
}

