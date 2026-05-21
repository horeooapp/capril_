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

    // 1. General Rate Limiting for API and Dashboard (ADD-SCALABILITY)
    if (path.startsWith("/api") || path.startsWith("/dashboard")) {
        const withinLimit = await checkRateLimit(`gen:${ip}`, 100, 60); // 100 per min
        if (!withinLimit) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    // 2. Strict Brute-Force Protection for Auth (ADD-SECURITY)
    if (path.startsWith("/api/auth") || path.startsWith("/api/mobile/login") || path.includes("/otp")) {
        const withinAuthLimit = await checkRateLimit(`auth:${ip}`, 5, 300); // 5 attempts per 5 minutes
        if (!withinAuthLimit) {
            console.warn(`[SECURITY] Potential brute-force detected from IP: ${ip} on path: ${path}`);
            return new NextResponse("Security Lock: Too Many Attempts", { status: 429 });
        }
    }

    return NextResponse.next();
})

export const config = {
    // Protect all routes globally except static assets and images
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|images|slider|assets|logos|logo.png|hero_.*\\.png|.*\\.svg|icon-.*\\.png).*)'
    ]
}
