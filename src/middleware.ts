export { auth as middleware } from "@/auth"

export const config = {
    // Protect all routes under /dashboard and /locataire
    matcher: ["/dashboard/:path*", "/locataire/:path*"]
}
