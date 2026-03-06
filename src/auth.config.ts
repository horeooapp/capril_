import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

export const authConfig = {
    session: { strategy: "jwt" },
    trustHost: true,
    pages: {
        signIn: '/login',
        verifyRequest: '/verify-request',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.isCertified = user.isCertified
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as Role
                session.user.isCertified = token.isCertified as boolean
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnLocataire = nextUrl.pathname.startsWith("/locataire");
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            if (isLoggedIn) {
                // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion/onboarding
                // On le laisse passer, les layouts ou pages redirigeront s'ils sont déjà "onboarded"
                return true;
            } else {
                // Si non connecté, on protège les routes privées
                if (isOnDashboard || isOnLocataire || isOnOnboarding || isOnAdmin) {
                    return false; // Redirige automatiquement vers /login
                }
                return true;
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
