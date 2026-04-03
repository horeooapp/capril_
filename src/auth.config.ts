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
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.onboardingComplete = (user as any).onboardingComplete
                token.diasporaAbonnement = (user as any).diasporaAbonnement
                token.eligibleRoles = (user as any).eligibleRoles
                token.requiresRoleSelection = (user as any).requiresRoleSelection
                token.capaciteActive = (user as any).capaciteActive
                token.capacites = (user as any).capacites
                
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
                (session.user as any).firstName = token.firstName as string;
                (session.user as any).lastName = token.lastName as string;
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                (session.user as any).profileType = token.profileType as string;
                (session.user as any).diasporaAbonnement = token.diasporaAbonnement as boolean;
                (session.user as any).eligibleRoles = token.eligibleRoles as string[];
                (session.user as any).chosenRole = token.chosenRole as string;
                (session.user as any).requiresRoleSelection = token.requiresRoleSelection as boolean;
                (session.user as any).capaciteActive = token.capaciteActive as string | null;
                (session.user as any).capacites = token.capacites as string[] || [];
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            const role = auth?.user?.role;

            // 1. PUBLIC PATHS
            const isPublic = 
                pathname === "/" ||
                pathname.includes("/login") ||
                pathname.startsWith("/api/webhooks") ||
                pathname.startsWith("/api/public") ||
                pathname.startsWith("/auth/") ||
                ["/impact", "/expertise", "/a-propos", "/faq", "/cgu", "/confidentialite", "/contact"].includes(pathname);

            if (isPublic) {
                if (isLoggedIn && pathname.includes("/login")) {
                    const onboardingFait = (auth?.user as any)?.onboardingComplete;
                    const chosenRole = (auth?.user as any)?.chosenRole;
                    const requiresRoleSelection = (auth?.user as any)?.requiresRoleSelection;
                    
                    if (requiresRoleSelection && !chosenRole) {
                        return Response.redirect(new URL("/auth/choose-role", nextUrl));
                    }
                    
                    const effectiveRole = chosenRole || role;

                    if (effectiveRole === 'TENANT') return Response.redirect(new URL("/locataire", nextUrl));
                    if (effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN') return Response.redirect(new URL("/admin", nextUrl));
                    
                    // LANDLORD
                    if (!onboardingFait) {
                         return Response.redirect(new URL("/onboarding", nextUrl));
                    }
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

            // 3. ROLE-BASED ACCESS CONTROL (ENFORCEMENT)
            const onboardingFait = (auth?.user as any)?.onboardingComplete;
            const eligibleRoles = (auth?.user as any)?.eligibleRoles || [role];
            const chosenRole = (auth?.user as any)?.chosenRole;
            const requiresRoleSelection = (auth?.user as any)?.requiresRoleSelection;

            // Enforce role selection if needed
            if (requiresRoleSelection && !chosenRole && !pathname.startsWith("/auth/choose-role") && !pathname.startsWith("/api/auth")) {
                return Response.redirect(new URL("/auth/choose-role", nextUrl));
            }

            // Access to Dashboard (Bailleurs, Agencies, Diaspora)
            if (pathname.startsWith("/dashboard")) {
                const hasDashAccess = eligibleRoles.some((r: string) => ['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA'].includes(r));
                if (!hasDashAccess) {
                    return Response.redirect(new URL("/locataire", nextUrl));
                }
                if (!onboardingFait && !pathname.startsWith("/onboarding")) {
                     return Response.redirect(new URL("/onboarding", nextUrl));
                }
            }
            
            // Access to Locataire
            if (pathname.startsWith("/locataire")) {
                if (!eligibleRoles.includes('TENANT')) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // Access to Admin
            if (pathname.startsWith("/admin")) {
                if (!eligibleRoles.includes('ADMIN') && !eligibleRoles.includes('SUPER_ADMIN')) {
                    if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
                         return Response.redirect(new URL("/dashboard", nextUrl));
                    }
                }
            }

            return true;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
