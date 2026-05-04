
/**
 * Generates a SHA-256 hash for reinforced proof.
 * Used for Mandates, Receipts, and Audit Logs.
 * 
 * Works in both Node.js and Edge Runtime.
 */
export async function generateProofHash(data: any): Promise<string> {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // 1. Try Web Crypto API (Edge / Modern Browsers)
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
        const msgUint8 = new TextEncoder().encode(stringData);
        const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 2. Fallback to Node.js crypto (using dynamic require to avoid Edge bundling issues)
    try {
        const { createHash } = require('crypto');
        return createHash('sha256').update(stringData).digest('hex');
    } catch (e) {
        console.error("[Proof] Hashing failed (no crypto available):", e);
        return "hash-failed-" + Date.now();
    }
}

/**
 * Generates a chained hash for Audit Logs.
 * currentHash = hash(prevHash + currentData)
 */
export async function chainAuditHash(prevHash: string | null, currentData: any): Promise<string> {
    const dataToHash = (prevHash || "") + JSON.stringify(currentData);
    return await generateProofHash(dataToHash);
}
