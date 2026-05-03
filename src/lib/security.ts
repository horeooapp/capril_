import { redis } from "./redis";

/**
 * Part 23.3: Security Hardening Utilities
 * Rate limiting, input sanitization, and security headers.
 */

/**
 * Distributed rate limiter using Redis.
 * Ensures consistent protection across multiple server instances.
 */
export async function checkRateLimit(key: string, maxRequests = 10, windowSec = 60): Promise<boolean> {
    if (!redis || redis.status === 'mock') {
        // Fallback simple pour le dev
        return true; 
    }

    try {
        const fullKey = `qapril:ratelimit:${key}`;
        const current = await redis.incr(fullKey);
        
        if (current === 1) {
            await redis.expire(fullKey, windowSec);
        }
        
        return current <= maxRequests;
    } catch (e) {
        console.error("[Security] Rate limit check failed:", e);
        return true; // Fail open to avoid blocking users on Redis failure
    }
}

/**
 * Sanitize user-provided strings to prevent XSS / SQL injection vectors.
 * Works as a first-pass defence; always parameterize DB queries.
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
    if (!input) return "";
    return input
        .trim()
        .substring(0, maxLength)
        .replace(/[<>]/g, '')                               // Strip < >
        .replace(/javascript:/gi, '')                       // Strip javascript:
        .replace(/on\w+="[^"]*"/gi, '')                     // Strip onEvent
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '') // Strip <script> blocks
        .replace(/expression\((.|\n)*\)/gi, '')             // Strip CSS expression
        .replace(/vbscript:/gi, '');                        // Strip vbscript:
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
    const { createHmac } = await import("crypto");
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
}
