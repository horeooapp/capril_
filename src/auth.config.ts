import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

export const authConfig = {
    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/dashboard/login',
        error: '/dashboard/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.phone = user.phone
                token.role = user.role as Role
                token.status = user.status
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.phone = token.phone as string
                session.user.role = (token.role as Role) || 'TENANT'
                session.user.status = token.status as any
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // --- 1. WHITELIST OF PUBLIC PATHS (ALWAYS ALLOWED) ---
            const publicPaths = [
                "/", 
                "/impact",
                "/expertise",
                "/a-propos",
                "/faq",
                "/admin/login", 
                "/dashboard/login", 
                "/locataire/login",
                "/cgu", 
                "/confidentialite", 
                "/contact",
                "/verify-request"
            ];
            
            const isPublicPath = publicPaths.some(path => 
                pathname === path || pathname === `${path}/`
            );
            const isApiPublic = pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/public");

            if (isPublicPath || isApiPublic) {
                return true;
            }

            // --- 2. PRIVATE ROUTES HANDLING ---
            if (isLoggedIn) {
                return true;
            } else {
                // Not logged in: Redirect to appropriate landing page
                
                // 1. ADMIN PROTECTION
                if (pathname.startsWith("/admin")) {
                    // Evite la boucle si on est déjà sur /admin/login ou /admin/login/
                    if (pathname.startsWith("/admin/login")) return true;
                    return Response.redirect(new URL("/admin/login", nextUrl));
                }
                
                // 2. DASHBOARD PROTECTION
                if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
                    if (pathname.startsWith("/dashboard/login")) return true;
                    return Response.redirect(new URL("/dashboard/login", nextUrl));
                }
                
                // 3. LOCATAIRE PROTECTION
                if (pathname.startsWith("/locataire")) {
                    if (pathname.startsWith("/locataire/login")) return true;
                    return Response.redirect(new URL("/locataire/login", nextUrl));
                }
                
                // Fallback for any other protected page: portal home
                return Response.redirect(new URL("/", nextUrl));
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
