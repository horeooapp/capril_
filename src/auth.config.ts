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
                token.profileType = (user as any).profileType
                token.status = user.status
                token.fullName = (user as any).fullName
                token.onboardingComplete = (user as any).onboardingComplete
                token.diasporaAbonnement = (user as any).diasporaAbonnement
                token.eligibleRoles = (user as any).eligibleRoles
                token.requiresRoleSelection = (user as any).requiresRoleSelection
                
                // Only default to a role if there's only one choice.
                // Otherwise, leave null to trigger the selection page.
                if ((user as any).eligibleRoles?.length === 1) {
                    token.chosenRole = (user as any).eligibleRoles[0]
                } else {
                    token.chosenRole = (user as any).chosenRole || null
                }
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
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                (session.user as any).profileType = token.profileType as string;
                (session.user as any).diasporaAbonnement = token.diasporaAbonnement as boolean;
                (session.user as any).eligibleRoles = token.eligibleRoles as string[];
                (session.user as any).chosenRole = token.chosenRole as string;
                (session.user as any).requiresRoleSelection = token.requiresRoleSelection as boolean;
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            const role = auth?.user?.role;

            // 1. PUBLIC PATHS (ALWAYS ALLOWED)
            const isPublic = 
                pathname === "/" ||
                pathname.includes("/login") ||
                pathname.startsWith("/api/webhooks") ||
                pathname.startsWith("/api/public") ||
                pathname.startsWith("/auth/") ||
                pathname === "/auth/choose-role" ||
                ["/impact", "/expertise", "/a-propos", "/faq", "/cgu", "/confidentialite", "/contact", "/verify-request"].includes(pathname);

            if (isPublic) {
                if (isLoggedIn && pathname.includes("/login")) {
                    const chosenRole = (auth?.user as any)?.chosenRole;
                    const requiresChoice = (auth?.user as any)?.requiresRoleSelection;

                    if (requiresChoice && !chosenRole) {
                         return Response.redirect(new URL("/auth/choose-role", nextUrl));
                    }

                    if (chosenRole === 'TENANT') return Response.redirect(new URL("/locataire", nextUrl));
                    if (chosenRole === 'ADMIN' || chosenRole === 'SUPER_ADMIN') return Response.redirect(new URL("/admin", nextUrl));
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // 2. PROTECTED ROUTES
            if (!isLoggedIn) {
                if (pathname.startsWith("/admin")) return Response.redirect(new URL("/admin/login", nextUrl));
                if (pathname.startsWith("/locataire")) return Response.redirect(new URL("/locataire/login", nextUrl));
                return Response.redirect(new URL("/dashboard/login", nextUrl));
            }

            // 2.5 MANDATORY ROLE SELECTION
            const chosenRole = (auth?.user as any)?.chosenRole;
            const requiresChoice = (auth?.user as any)?.requiresRoleSelection;

            if (requiresChoice && !chosenRole && pathname !== "/auth/choose-role") {
                return Response.redirect(new URL("/auth/choose-role", nextUrl));
            }

            // 3. ROLE-BASED ACCESS CONTROL (ENFORCEMENT)
            // Use chosenRole instead of default role if available
            const activeRole = chosenRole || role;

            if (activeRole === 'TENANT' && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
                return Response.redirect(new URL("/locataire", nextUrl));
            }
            
            if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && !pathname.startsWith("/admin")) {
                if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
                     return Response.redirect(new URL("/admin", nextUrl));
                }
            }
            
            if ((role === 'LANDLORD' || role === 'LANDLORD_PRO' || role === 'AGENCY') && (pathname.startsWith("/locataire") || pathname.startsWith("/admin"))) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
