import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User } from "lucide-react"

import LocataireLayoutClient from "./layout-client"
import { prisma } from "@/lib/prisma"
import { isRoleGloballyActive } from "@/lib/role-lock"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (session?.user) {
        // CRITICAL: Verify Global Role Concurrency Lock
        const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
        if (!isGloballyActive) {
            // This browser has a stale role, force logout
            redirect("/api/auth/signout")
        }

        if (activeRole !== "TENANT") {
            redirect("/dashboard")
        }
    }

    // 3. Security: Check onboarding but with extreme robustness
    if (activeRole === "TENANT") {
        try {
            if (!session?.user?.id) {
                // Should not happen, but prevents Prisma crash
                return redirect("/locataire/login")
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { onboardingComplete: true }
            })

            if (!user) {
                // User probably deleted after DB reset
                return redirect("/locataire/login")
            }

            if (!user.onboardingComplete) {
                return redirect("/onboarding/tenant")
            }
        } catch (dbError) {
            console.error("[LAYOUT-LOCATAIRE] Critical Error in Onboarding Check:", dbError)
            // If DB is failing, better to allow access with a console log than to crash everything
            // or we could redirect to a maintenance page
        }
    }

    const handleLogout = async () => {
        "use server"
        await logout()
    }

    return (
        <LocataireLayoutClient 
            session={session} 
            onLogout={handleLogout}
        >
            {children}
        </LocataireLayoutClient>
    )
}
