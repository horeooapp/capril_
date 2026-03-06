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
            const userRole = auth?.user?.role;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnLocataire = nextUrl.pathname.startsWith("/locataire");
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");

            if (isLoggedIn) {
                // Determine if this is a brand new user (default is TENANT, but we want to intercept them)
                // Since Prisma defaults to TENANT, we might need a way to know if they explicitly chose it.
                // For this implementation, let's assume if it's their FIRST login, they should go to onboarding.
                // However, without a flag, we'll route based on role:
                // LANDLORD / AGENCY / ADMIN -> /dashboard
                // TENANT -> /locataire
                
                if (isOnOnboarding) {
                    return true;
                }

                if (isOnDashboard) {
                    if (userRole === 'TENANT') {
                        // Tenants cannot access the landlord dashboard
                        return Response.redirect(new URL("/locataire", nextUrl));
                    }
                    return true;
                }

                if (isOnLocataire) {
                    if (userRole === 'LANDLORD' || userRole === 'AGENCY' || userRole === 'ADMIN') {
                        // Landlords should use the main dashboard
                        return Response.redirect(new URL("/dashboard", nextUrl));
                    }
                    return true;
                }

                // If they go to the root or login page while logged in, redirect them
                if (nextUrl.pathname === "/" || nextUrl.pathname === "/login") {
                     if (userRole === 'LANDLORD' || userRole === 'AGENCY' || userRole === 'ADMIN') {
                         return Response.redirect(new URL("/dashboard", nextUrl));
                     } else {
                         return Response.redirect(new URL("/locataire", nextUrl));
                     }
                }

                return true;
            } else {
                 if (isOnDashboard || isOnLocataire || isOnOnboarding) {
                     return false; // Redirect to login
                 }
                 return true;
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
