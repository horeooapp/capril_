import type { NextAuthConfig } from "next-auth"


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
            const pathname = nextUrl.pathname;

            // --- PUBLIC ROUTES (No Auth Required) ---
            const isRoot = pathname === "/";
            const isLoginPath = pathname.endsWith("/login");
            const isPublicLegal = pathname === "/cgu" || pathname === "/confidentialite" || pathname === "/contact";
            const isApiPublic = pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/public");

            if (isRoot || isLoginPath || isPublicLegal || isApiPublic) {
                return true;
            }

            // --- PRIVATE ROUTES ---
            if (isLoggedIn) {
                // Potential role-based redirects could stay here
                return true;
            } else {
                // Redirect to specialized login or landing page
                if (pathname.startsWith("/admin")) {
                    return Response.redirect(new URL("/admin/login", nextUrl));
                }
                if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
                    return Response.redirect(new URL("/dashboard/login", nextUrl));
                }
                if (pathname.startsWith("/locataire")) {
                    return Response.redirect(new URL("/locataire/login", nextUrl));
                }
                
                // For everything else (other pages), redirect to the premium landing page (lock)
                return Response.redirect(new URL("/", nextUrl));
            }
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
} satisfies NextAuthConfig;
