import { handlers } from "@/auth"

console.log("[AUTH-DEBUG] API Route Init - Secret exists:", !!process.env.AUTH_SECRET);
console.log("[AUTH-DEBUG] API Route Init - URL:", process.env.NEXTAUTH_URL || process.env.AUTH_URL || "Auto-detect");

export const dynamic = "force-dynamic"
export const { GET, POST } = handlers
