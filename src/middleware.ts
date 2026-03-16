import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    // Protect all routes globally except static assets and images
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images|logo.png).*)'
    ]
}
