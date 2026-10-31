import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { redis } from "./lib/redis"
import { checkRateLimit } from "./lib/security"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "anonymous";
    const path = req.nextUrl.pathname;

    // 0. URL Normalization (Prevent double slashes)
    if (path.includes("//")) {
        const normalizedPath = path.replace(/\/+/g, "/");
        const url = req.nextUrl.clone();
        url.pathname = normalizedPath;
        return NextResponse.redirect(url, 301);
    }

    // 1. Limitation générale pour /api et /dashboard
    if (path.startsWith("/api") || path.startsWith("/dashboard")) {
        const withinLimit = await checkRateLimit(`gen:${ip}`, 100, 60); // 100 par minute
        if (!withinLimit) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    // 2. [SEC-FIX F-06] Protection stricte brute-force sur les routes d'auth et OTP
    // Couvre /api/auth, /api/mobile/auth, /api/mobile/shared/*/otp et /api/v1/auth/otp
    const isSensitiveAuth = path.startsWith("/api/auth")
        || path.startsWith("/api/mobile/auth")
        || path.startsWith("/api/mobile/login")
        || path.includes("/otp");

    if (isSensitiveAuth) {
        const withinAuthLimit = await checkRateLimit(`auth:${ip}`, 5, 300); // 5 tentatives / 5 min
        if (!withinAuthLimit) {
            console.warn(`[SECURITY] Potential brute-force from IP: ${ip} on: ${path}`);
            return new NextResponse("Security Lock: Too Many Attempts", { status: 429 });
        }
    }

    // 3. [SEC-FIX F-06] Protection stricte sur la route de paiement mobile
    if (path.startsWith("/api/mobile/pay-rent")) {
        const withinPayLimit = await checkRateLimit(`pay:${ip}`, 10, 60); // 10 par minute
        if (!withinPayLimit) {
            console.warn(`[SECURITY] Payment rate limit exceeded from IP: ${ip}`);
            return new NextResponse("Too Many Payment Requests", { status: 429 });
        }
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', path);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });

    // Privacy by Design — Principe 5 : Headers de sécurité et de confidentialité
    // Limitation des API navigateur accessibles (caméra, micro, géolocalisation)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), serial=()'
    );
    // Prévention de la fuite d'informations via le header Referer
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Prévention du MIME-sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Prévention du clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    // HSTS : forçage HTTPS (1 an)
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );
    // Suppression des informations de version du serveur
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;
})

export const config = {
    // Protect all routes globally except static assets, images and uploads
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|images|uploads|slider|assets|logos|logo.png|hero_.*\\.png|.*\\.svg|icon-.*\\.png).*)'
    ]
}
