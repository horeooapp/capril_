import { redis } from "./redis";

/**
 * Part 23.3: Security Hardening Utilities
 * Rate limiting, input sanitization, and security headers.
 */

// Cache in-memory de secours (Fallback) pour le Rate Limiting en cas de panne Redis
const memoryFallback = new Map<string, { count: number; expiresAt: number }>();

function checkMemoryRateLimit(key: string, maxRequests: number, windowSec: number): boolean {
    const now = Date.now();
    const entry = memoryFallback.get(key);
    if (!entry || now > entry.expiresAt) {
        memoryFallback.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
        // Nettoyage automatique si la Map grandit trop
        if (memoryFallback.size > 10000) {
            for (const [k, v] of memoryFallback.entries()) {
                if (now > v.expiresAt) memoryFallback.delete(k);
            }
        }
        return 1 <= maxRequests;
    }
    entry.count++;
    return entry.count <= maxRequests;
}

/**
 * Distributed rate limiter using Redis with an automatic In-Memory Fallback.
 * Ensures consistent protection even if Redis is temporarily unavailable (no fail-open vulnerability).
 */
export async function checkRateLimit(key: string, maxRequests = 10, windowSec = 60): Promise<boolean> {
    if (!redis) {
        // Fallback sécurisé in-memory au lieu d'échouer ouvertement (fail open)
        return checkMemoryRateLimit(key, maxRequests, windowSec);
    }

    try {
        const fullKey = `qapril:ratelimit:${key}`;
        const current = await redis.incr(fullKey);
        
        if (current === 1) {
            await redis.expire(fullKey, windowSec);
        }
        
        return current <= maxRequests;
    } catch (e) {
        console.warn("[Security] Redis Rate limit failed, switching to in-memory fallback:", e);
        return checkMemoryRateLimit(key, maxRequests, windowSec);
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
