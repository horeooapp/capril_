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

    // CRITICAL: Verify Global Role Concurrency Lock
    const activeRole = (session.user as any).chosenRole || session.user.role;
    const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
    if (!isGloballyActive) {
        // This browser has a stale role, force logout
        redirect("/api/auth/signout")
    }

    // Role Enforcement based on activeRole, NOT hardcoded dbUser.role
    // because a user with dbUser.role === "TENANT" is allowed here if activeRole === "LANDLORD".
    if (activeRole === "TENANT") {
        redirect("/locataire")
    }

    if (activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") {
        redirect("/admin")
    }

    return (
        <DashboardLayoutClient session={session} agencyConfig={(dbUser as any).agencyConfig}>
            {children}
        </DashboardLayoutClient>
    )
}
