import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    // Protect all routes globally except static assets and images
    matcher: [
        '/((?!api|admin/debug-page|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|images|logo.png|hero_.*\\.png|.*\\.svg|icon-.*\\.png).*)'
    ]
}
