import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardLayoutClient from "./layout-client"
import { isRoleGloballyActive } from "@/lib/role-lock"

// Import Midnight Onyx V2 Stylesheet
import "@/app/admin/admin-v2.css"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/dashboard/login")
    }

    // CRITICAL: Verify if user still exists in DB (to prevent stale session crashes after DB resets)
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!dbUser) {
        // Log out the zombie session by redirecting back to login
        redirect("/dashboard/login")
    }

    // CRITICAL (Rule R-01): Verify active role carefully. 
    // We prioritize DB state (capaciteActive) because cookie updates can lag behind UI.
    // If capaciteActive is null, we fallback to session's chosenRole or default role.
    const activeRole = (dbUser as any).capaciteActive || (session.user as any).chosenRole || session.user.role;
    const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
    if (!isGloballyActive) {
        // Just sync redis with DB to self-heal
        const { redis } = await import("@/lib/redis");
        if (redis) await redis.set(`user:active_role:${session.user.id}`, activeRole);
    }

    // Role Enforcement based on activeRole, NOT hardcoded dbUser.role
    // because a user with dbUser.role === "TENANT" is allowed here if activeRole === "LANDLORD".
    if (activeRole === "TENANT") {
        redirect("/mon-espace-locataire")
    }

    if (activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") {
        redirect("/admin")
    }

    return (
        <div className="admin-v2">
            <DashboardLayoutClient session={session} dbActiveRole={activeRole} agencyConfig={(dbUser as any).agencyConfig}>
                {children}
            </DashboardLayoutClient>
        </div>
    )
}
