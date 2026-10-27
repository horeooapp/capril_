import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardLayoutClient from "./layout-client"
import { isRoleGloballyActive } from "@/lib/role-lock"

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

    // CRITICAL: Determine effective active role
    let activeRole = (dbUser as any).capaciteActive || (session.user as any).chosenRole || session.user.role;

    // Check if user has landlord/agency capabilities
    const userCapacites = ((dbUser as any).capacites as string[]) || [];
    const canAccessDashboard = ['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'PROPRIETAIRE', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'INTERMEDIAIRE'].includes(dbUser.role) ||
        userCapacites.some((c: string) => ['PROPRIETAIRE', 'LANDLORD', 'LANDLORD_PRO', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'INTERMEDIAIRE', 'AGENCY'].includes(c.toUpperCase()));

    // If activeRole is TENANT but user has landlord capabilities, switch activeRole automatically to PROPRIETAIRE
    if (activeRole === "TENANT" && canAccessDashboard) {
        activeRole = "PROPRIETAIRE";
        await prisma.user.update({
            where: { id: dbUser.id },
            data: { capaciteActive: "PROPRIETAIRE" }
        }).catch(() => {});
    }

    const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
    if (!isGloballyActive && activeRole) {
        // Just sync redis with DB to self-heal
        try {
            const { redis } = await import("@/lib/redis");
            if (redis) await redis.set(`user:active_role:${session.user.id}`, activeRole);
        } catch(e) {
            console.error("Redis self-heal error:", e);
        }
    }

    // Role Enforcement: Only redirect to tenant space if user is strictly a tenant with no dashboard capabilities
    if (activeRole === "TENANT" && !canAccessDashboard) {
        redirect("/mon-espace-locataire")
    }

    if (activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") {
        redirect("/admin")
    }

    return (
        <DashboardLayoutClient session={session} dbActiveRole={activeRole} agencyConfig={(dbUser as any).agencyConfig}>
            {children}
        </DashboardLayoutClient>
    )
}
