// Pure JS Base64 and UTF-8 helpers for universal compatibility (Web, Node, Hermes, iOS, Android)
// @ts-ignore
import * as naclModule from './nacl.js';
const nacl: any = (naclModule as any)?.secretbox ? naclModule : ((naclModule as any)?.default || naclModule);

const E2EE_PREFIX = 'QAPRIL_E2EE:v1:';

// Universal UTF-8 encode
function stringToUint8(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

// Universal UTF-8 decode
function uint8ToString(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }
  let out = '';
  let i = 0;
  const len = bytes.length;
  while (i < len) {
    const c = bytes[i++];
    if (c < 128) {
      out += String.fromCharCode(c);
    } else if (c > 191 && c < 224) {
      const c2 = bytes[i++];
      out += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
    } else if (c > 223 && c < 240) {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      out += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    } else {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      const c4 = bytes[i++];
      let u = (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
      out += String.fromCharCode(0xd800 + (u >> 10));
      out += String.fromCharCode(0xdc00 + (u & 1023));
    }
  }
  return out;
}

// Universal Base64 encode
function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a: number, b: number, c: number, d: number;
  let chunk: number;

  for (let i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += chars[a] + chars[b] + '==';
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += chars[a] + chars[b] + chars[c] + '=';
  }

  return base64;
}

// Universal Base64 decode
function base64ToUint8(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (base64[i + 2] !== '=') {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (base64[i + 3] !== '=') {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }
  return bytes;
}

/**
 * Dérive une clé cryptographique symétrique (256 bits) dédiée au bail.
 * Basé sur TweetNaCl hash (SHA-512) tronqué à 32 octets.
 */
export function deriveLeaseKey(leaseId: string, salt: string = 'QAPRIL_E2EE_CANAL_SECURISE'): Uint8Array {
  const seed = stringToUint8(`${salt}:${leaseId}`);
  const hashed = nacl.hash(seed);
  return hashed.subarray(0, nacl.secretbox.keyLength);
}

/**
 * Vérifie si un message est chiffré de bout en bout.
 */
export function isEncryptedMessage(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.startsWith(E2EE_PREFIX);
}

/**
 * Chiffre un message avant son envoi sur le réseau (E2EE côté client).
 * Utilise XSalsa20-Poly1305 (TweetNaCl SecretBox).
 */
export function encryptChatMessage(plaintext: string, leaseId: string): string {
  if (!plaintext || !leaseId) return plaintext;
  try {
    const key = deriveLeaseKey(leaseId);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageBytes = stringToUint8(plaintext);
    const boxed = nacl.secretbox(messageBytes, nonce, key);

    const nonceB64 = uint8ToBase64(nonce);
    const boxB64 = uint8ToBase64(boxed);

    return `${E2EE_PREFIX}${nonceB64}:${boxB64}`;
  } catch (error) {
    console.warn('[E2EE] Erreur lors du chiffrement du message:', error);
    return plaintext;
  }
}

/**
 * Déchiffre un message chiffré de bout en bout (E2EE côté client).
 * Si le message n'est pas chiffré (legacy), il est retourné en clair tel quel.
 */
export function decryptChatMessage(rawMessage: string | null | undefined, leaseId: string): string {
  if (!rawMessage) return '';
  if (!isEncryptedMessage(rawMessage)) {
    return rawMessage;
  }
  try {
    const payload = rawMessage.slice(E2EE_PREFIX.length);
    const colonIdx = payload.indexOf(':');
    if (colonIdx === -1) return rawMessage;

    const nonceB64 = payload.slice(0, colonIdx);
    const boxB64 = payload.slice(colonIdx + 1);

    const key = deriveLeaseKey(leaseId);
    const nonce = base64ToUint8(nonceB64);
    const box = base64ToUint8(boxB64);

    const opened = nacl.secretbox.open(box, nonce, key);
    if (!opened) {
      console.warn('[E2EE] Échec d\'authentification du message chiffré.');
      return '🔒 [Message sécurisé non déchiffrable]';
    }
    return uint8ToString(opened);
  } catch (error) {
    console.warn('[E2EE] Erreur lors du déchiffrement:', error);
    return rawMessage;
  }
}
