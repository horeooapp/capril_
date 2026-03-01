import { createHash } from "crypto"

/**
 * Generates a SHA-256 hash for reinforced proof.
 * Used for Mandates, Receipts, and Audit Logs.
 */
export function generateProofHash(data: any): string {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data)
    return createHash('sha256').update(stringData).digest('hex')
}

/**
 * Generates a chained hash for Audit Logs.
 * currentHash = hash(prevHash + currentData)
 */
export function chainAuditHash(prevHash: string | null, currentData: any): string {
    const dataToHash = (prevHash || "") + JSON.stringify(currentData)
    return generateProofHash(dataToHash)
}
