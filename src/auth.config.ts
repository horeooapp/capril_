import type { NextAuthConfig } from "next-auth"


export const authConfig = {
    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
    pages: {
        signIn: '/dashboard/login',
        error: '/auth/error',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.phone = user.phone
                token.role = user.role
                token.status = user.status
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.phone = token.phone as string
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.user.role = token.role as any
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.user.status = token.status as any
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnLocataire = nextUrl.pathname.startsWith("/locataire");
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            // Avoid infinite redirects on login pages
            const isLoginPath = nextUrl.pathname.endsWith("/login");
            if (isLoginPath) return true;

            if (isLoggedIn) {
                return true;
            } else {
                if (isOnAdmin) {
                    return Response.redirect(new URL("/admin/login", nextUrl));
                }
                if (isOnDashboard || isOnOnboarding) {
                    return Response.redirect(new URL("/dashboard/login", nextUrl));
                }
                if (isOnLocataire) {
                    return Response.redirect(new URL("/locataire/login", nextUrl));
                }
                return true;
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
