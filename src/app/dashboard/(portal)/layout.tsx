import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardLayoutClient from "./layout-client"

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

    if (session.user.role === "TENANT" || dbUser.role === "TENANT") {
        redirect("/locataire")
    }

    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
        redirect("/admin")
    }

    return (
        <DashboardLayoutClient session={session}>
            {children}
        </DashboardLayoutClient>
    )
}
