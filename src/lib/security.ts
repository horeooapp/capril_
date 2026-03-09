/**
 * Part 23.3: Security Hardening Utilities
 * Rate limiting, input sanitization, and security headers.
 */

/**
 * Simple in-memory rate limiter (per IP per minute).
 * In production, replace with Redis-based solution.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return true; // Within limit
    }

    if (entry.count >= maxRequests) return false; // Rate limit exceeded

    entry.count++;
    return true;
}

/**
 * Sanitize user-provided strings to prevent XSS / SQL injection vectors.
 * Works as a first-pass defence; always parameterize DB queries.
 */
export function sanitizeInput(input: string, maxLength = 500): string {
    return input
        .trim()
        .substring(0, maxLength)
        .replace(/[<>]/g, '')               // Strip bare HTML brackets
        .replace(/javascript:/gi, '')       // Strip JS injection prefix
        .replace(/on\w+="[^"]*"/gi, '');    // Strip inline event handlers
}

/**
 * Validate Ivorian phone number format (+225XXXXXXXXX)
 */
export function validateCIPhone(phone: string): boolean {
    return /^\+225[0-9]{10}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Validate RCCM number format (for commercial tenants)
 * Example: CI-ABJ-2026-B-12345
 */
export function validateRCCM(rccm: string): boolean {
    return /^CI-[A-Z]{3}-\d{4}-[A-Z]-\d{1,6}$/.test(rccm);
}

/**
 * Minimal HMAC signature verification for webhook payloads.
 * Usage: checkWebhookSignature(rawBody, sig, process.env.WEBHOOK_SECRET!)
 */
export async function checkWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
): Promise<boolean> {
    const { createHmac } = await import("node:crypto");
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
}
