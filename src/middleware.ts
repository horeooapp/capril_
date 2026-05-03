import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { redis } from "./lib/redis"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "anonymous";
    const path = req.nextUrl.pathname;

    // 1. Rate Limiting for API and Dashboard (ADD-SCALABILITY)
    if (path.startsWith("/api") || path.startsWith("/dashboard")) {
        try {
            if (redis && typeof redis.get === 'function') {
                const limit = 100; // 100 requests
                const windowSize = 60; // 60 seconds
                const key = `ratelimit:${ip}`;
                
                const currentCount = await redis.get(key);
                if (currentCount && parseInt(currentCount) >= limit) {
                    return new NextResponse("Too Many Requests", { status: 429 });
                }

                if (!currentCount) {
                    await redis.set(key, "1", "EX", windowSize);
                } else {
                    await redis.incr(key);
                }
            }
        } catch (e) {
            console.error("[Middleware] Rate limiting error:", e);
            // On laisse passer en cas d'erreur Redis pour éviter de bloquer tout le monde
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
