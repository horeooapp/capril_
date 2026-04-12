/**
 * Normalizes an Ivory Coast phone number to the standard format +225 XX XX XX XX XX
 * or +225 XXXXXXXXXX (with a single space after prefix).
 * QAPRIL Standard: "+225 " + 10 digits
 */
export function normalizePhone(phone: string): string {
    if (!phone) return "";
    
    // 1. Remove all whitespace and special characters
    let cleaned = phone.replace(/[\s\(\)\-\.]/g, "");
    
    // 2. Handle international prefix
    if (cleaned.startsWith("+225")) {
        cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith("225") && cleaned.length > 10) {
        cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith("00225")) {
        cleaned = cleaned.substring(5);
    }
    
    // 3. Ensure we have exactly 10 digits (leading 0 might still be there)
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
        // This shouldn't happen with 10-digit CI numbers usually, 
        // but just in case of over-prefixing
        cleaned = cleaned.substring(1);
    } else if (cleaned.length === 9) {
        // Old 8-digit format? Need to handle transition logic?
        // In CI, numbers went from 8 to 10 digits in 2021.
        // For now, we assume 10 digits.
    }
    
    // 4. Final format: +225 XXXXXXXXXX
    return `+225 ${cleaned}`;
}

/**
 * Checks if a phone number is already normalized.
 */
export function isNormalized(phone: string): boolean {
    return /^\+225 \d{10}$/.test(phone);
}
