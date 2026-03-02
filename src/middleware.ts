import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    // Protect all routes under /dashboard and /locataire
    matcher: ["/dashboard/:path*", "/locataire/:path*"]
}
