import type { NextAuthConfig } from "next-auth"
import { Role } from "@prisma/client"

export const authConfig = {
    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/dashboard/login',
        error: '/dashboard/login', // Redirect back to login on error for now
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
                "/admin/login", 
                "/dashboard/login", 
                "/locataire/login",
                "/cgu", 
                "/confidentialite", 
                "/contact",
                "/verify-request"
            ];
            
            const isPublicPath = publicPaths.includes(pathname);
            const isApiPublic = pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/public");

            if (isPublicPath || isApiPublic) {
                return true;
            }

            // --- 2. PRIVATE ROUTES HANDLING ---
            if (isLoggedIn) {
                return true;
            } else {
                // Not logged in: Redirect to appropriate landing page
                // IMPORTANT: Ensure we don't redirect if already on a login page (safety double-check)
                if (pathname === "/admin/login") return true;
                
                if (pathname.startsWith("/admin")) {
                    return Response.redirect(new URL("/admin/login", nextUrl));
                }
                
                if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
                    return Response.redirect(new URL("/dashboard/login", nextUrl));
                }
                
                if (pathname.startsWith("/locataire")) {
                    return Response.redirect(new URL("/locataire/login", nextUrl));
                }
                
                // Fallback for any other protected page: portal home
                return Response.redirect(new URL("/", nextUrl));
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
