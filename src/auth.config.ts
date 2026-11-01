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
            if (trigger === "update" && session) {
                const updateData = session.user ? session.user : session;
                if (updateData.chosenRole) {
                    token.chosenRole = updateData.chosenRole;
                    token.role = updateData.chosenRole as Role;
                    token.capaciteActive = updateData.chosenRole;
                }
                if (updateData.role) {
                    token.role = updateData.role as Role;
                    token.chosenRole = updateData.role;
                }
                if (updateData.capaciteActive) {
                    token.capaciteActive = updateData.capaciteActive;
                    token.chosenRole = updateData.capaciteActive;
                    token.role = updateData.capaciteActive as Role;
                }
                Object.assign(token, updateData);
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
                token.agencyName = (user as any).agencyName;
                token.onboardingComplete = (user as any).onboardingComplete
                token.diasporaAbonnement = (user as any).diasporaAbonnement
                token.eligibleRoles = (user as any).eligibleRoles
                token.requiresRoleSelection = false
                token.capacites = (user as any).capacites
            }

            // Calcul systématique du displayName selon le rôle actif :
            // Pour Agence : Nom de l'Agence
            // Pour Propriétaire, Locataire, Intermédiaire : Prénom et Nom
            const currentRole = String(token.chosenRole || token.role || '').toUpperCase();
            const isAgencyRole = ['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE'].includes(currentRole);
            const individualFullName = [token.firstName, token.lastName].filter(Boolean).join(" ").trim();

            if (isAgencyRole) {
                token.displayName = ((token.agencyName as string) || individualFullName || "Mon Agence");
            } else {
                token.displayName = (individualFullName || (token.displayName as string) || (token.email as string)?.split('@')[0] || "Utilisateur");
            }
            token.name = (token.displayName as string) || undefined;

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
                (session.user as any).agencyName = token.agencyName as string;
                (session.user as any).displayName = token.displayName as string;
                session.user.name = token.displayName as string;
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

            // 1. CHEMINS PUBLICS (Les API gèrent leur propre sécurité/tokens)
            const isPublic =
                pathname === "/" ||
                pathname.includes("/login") ||
                pathname.startsWith("/api/") ||
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
            const eligibleRoles: string[] = (auth?.user as any)?.eligibleRoles || [];
            const hasDashboardRole = eligibleRoles.some(r => ['LANDLORD', 'PROPRIETAIRE', 'BAILLEUR', 'AGENCY', 'AGENCE_AGREE', 'NON_CERTIFIED_AGENT', 'INTERMEDIARY', 'DIASPORA'].includes(String(r).toUpperCase()));
            const hasTenantRole = eligibleRoles.some(r => ['TENANT', 'LOCATAIRE'].includes(String(r).toUpperCase()));

            // Route Admin
            if (pathname.startsWith("/admin")) {
                if (!isAdmin) {
                    if (isTenant && !hasDashboardRole) return Response.redirect(new URL("/mon-espace-locataire", nextUrl));
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Route Espace Locataire (/mon-espace-locataire)
            if (pathname.startsWith("/mon-espace-locataire")) {
                if (!isTenant && !isAdmin && !hasTenantRole) {
                    // Uniquement si l'utilisateur n'a aucun profil locataire
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Route Dashboard Gestionnaire/Propriétaire (/dashboard)
            if (pathname.startsWith("/dashboard")) {
                if (isTenant && !isAdmin) {
                    // Si le profil actuel est TENANT, mais qu'il possède la capacité Propriétaire/Gestionnaire,
                    // on autorise l'accès pour permettre le basculement direct sur /dashboard
                    if (!hasDashboardRole) {
                        return Response.redirect(new URL("/mon-espace-locataire", nextUrl));
                    }
                }
                return true;
            }

            return true;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;