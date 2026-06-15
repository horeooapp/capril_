/**
 * Utility functions for phone number formatting and normalization.
 */

/**
 * Normalizes a phone number by:
 * 1. Removing all spaces, dashes, and other formatting characters.
 * 2. Ensuring it has the country code prefix (defaults to +225 if not provided).
 * 
 * @param phone The raw phone number string
 * @param defaultPrefix The default country code to prefix if missing (default: '+225')
 * @returns The normalized phone number
 */
export function normalizePhone(phone: string | null | undefined, defaultPrefix: string = '+225'): string {
    if (!phone) return '';
    
    // Remove all whitespace, dashes, periods, parentheses
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

    if (!cleaned) return '';

    // If it starts with 00, replace with +
    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2);
    }

    // If it doesn't start with +, assume it's a local number and add the default prefix
    if (!cleaned.startsWith('+')) {
        // e.g. 0505007188 -> +2250505007188
        cleaned = defaultPrefix + cleaned;
    }

    return cleaned;
}
export function isNormalized(phone: string | null | undefined): boolean {
    if (!phone) return true;
    return phone === normalizePhone(phone);
}
