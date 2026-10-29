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
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                Object.assign(token, session.user);
                if (session.user.role) token.role = session.user.role;
                if (session.user.chosenRole) token.chosenRole = session.user.chosenRole;
            }
            if (user) {
                const activeRole = (user as any).chosenRole || (user as any).capaciteActive || user.role || 'TENANT';
                token.id = user.id
                token.email = user.email
                token.phone = user.phone
                token.role = activeRole as Role
                token.chosenRole = activeRole
                token.capaciteActive = activeRole
                token.profileType = (user as any).profileType
                token.status = user.status
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.onboardingComplete = (user as any).onboardingComplete
                token.diasporaAbonnement = (user as any).diasporaAbonnement
                token.eligibleRoles = (user as any).eligibleRoles
                token.requiresRoleSelection = false
                token.capacites = (user as any).capacites
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                const activeRole = ((token.chosenRole as string) || (token.role as string) || 'TENANT') as Role;
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.phone = token.phone as string
                session.user.role = activeRole;
                (session.user as any).chosenRole = activeRole;
                (session.user as any).capaciteActive = activeRole
                session.user.status = token.status as any
                (session.user as any).firstName = token.firstName as string;
                (session.user as any).lastName = token.lastName as string;
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                (session.user as any).profileType = token.profileType as string;
                (session.user as any).diasporaAbonnement = token.diasporaAbonnement as boolean;
                (session.user as any).eligibleRoles = token.eligibleRoles as string[];
                (session.user as any).requiresRoleSelection = false;
                (session.user as any).capacites = token.capacites as string[] || [];
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            const activeRole = String((auth?.user as any)?.chosenRole || auth?.user?.role || (auth?.user as any)?.capaciteActive || '').toUpperCase();

            // 1. CHEMINS PUBLICS
            const isPublic =
                pathname === "/" ||
                pathname.includes("/login") ||
                pathname.startsWith("/api/webhooks") ||
                pathname.startsWith("/api/public") ||
                pathname.startsWith("/api/system") ||
                pathname.startsWith("/auth/") ||
                pathname.startsWith("/setup") ||
                pathname.startsWith("/uploads/") ||
                ["/impact", "/expertise", "/a-propos", "/faq", "/cgu", "/confidentialite", "/contact", "/mentions-legales", "/blog", "/presse", "/carriere", "/cookies", "/fonctionnalites", "/comment-ca-marche", "/temoignages", "/tarifs", "/piliers", "/solutions", "/services", "/modules", "/comparatif"].includes(pathname);

            // Redirection intelligente si déjà connecté sur /login générique
            if (isLoggedIn && pathname === "/login") {
                if (['ADMIN', 'SUPER_ADMIN'].includes(activeRole)) return Response.redirect(new URL("/admin", nextUrl));
                if (['TENANT', 'LOCATAIRE'].includes(activeRole)) return Response.redirect(new URL("/mon-espace-locataire", nextUrl));
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            if (isPublic) return true;

            // 2. CHEMINS PROTÉGÉS - UTILISATEUR NON CONNECTÉ
            if (!isLoggedIn) {
                if (pathname.startsWith("/admin")) return Response.redirect(new URL("/admin/login", nextUrl));
                if (pathname.startsWith("/mon-espace-locataire")) return Response.redirect(new URL("/mon-espace-locataire/login", nextUrl));
                return Response.redirect(new URL("/dashboard/login", nextUrl));
            }

            // 3. CONTRÔLE D'ACCÈS STRICT SELON LE RÔLE ACTIF (RBAC)
            const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(activeRole);
            const isTenant = ['TENANT', 'LOCATAIRE'].includes(activeRole);

            // Route Admin
            if (pathname.startsWith("/admin")) {
                if (!isAdmin) {
                    if (isTenant) return Response.redirect(new URL("/mon-espace-locataire", nextUrl));
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Route Espace Locataire (/mon-espace-locataire)
            if (pathname.startsWith("/mon-espace-locataire")) {
                if (!isTenant && !isAdmin) {
                    // Un propriétaire/agence connecté ne peut pas naviguer dans l'espace locataire
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Route Dashboard Gestionnaire/Propriétaire (/dashboard)
            if (pathname.startsWith("/dashboard")) {
                if (isTenant && !isAdmin) {
                    // Un locataire connecté ne peut JAMAIS être devant le dashboard propriétaire
                    return Response.redirect(new URL("/mon-espace-locataire", nextUrl));
                }
                return true;
            }

            return true;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;