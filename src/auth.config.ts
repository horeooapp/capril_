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
                token.email = user.email
                token.phone = user.phone
                token.role = user.role as Role
                token.status = user.status
                token.fullName = (user as any).fullName
                token.onboardingComplete = (user as any).onboardingComplete
                token.diasporaAbonnement = (user as any).diasporaAbonnement
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.phone = token.phone as string
                session.user.role = (token.role as Role) || 'TENANT'
                session.user.status = token.status as any
                session.user.fullName = token.fullName as string
                session.user.onboardingComplete = token.onboardingComplete as boolean
                (session.user as any).diasporaAbonnement = token.diasporaAbonnement as boolean
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // 1. PUBLIC PATHS (ALWAYS ALLOWED)
            // We include all login pages and critical public assets
            const isPublic = 
                pathname === "/" ||
                pathname.includes("/login") ||
                pathname.startsWith("/api/webhooks") ||
                pathname.startsWith("/api/public") ||
                pathname.startsWith("/auth/") ||
                ["/impact", "/expertise", "/a-propos", "/faq", "/cgu", "/confidentialite", "/contact", "/verify-request"].includes(pathname);

            if (isPublic) return true;

            // 2. PROTECTED ROUTES
            if (!isLoggedIn) {
                // If not logged in, redirect to the relevant login page based on the path
                if (pathname.startsWith("/admin")) return Response.redirect(new URL("/admin/login", nextUrl));
                if (pathname.startsWith("/locataire")) return Response.redirect(new URL("/locataire/login", nextUrl));
                return Response.redirect(new URL("/dashboard/login", nextUrl));
            }

            return true;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
