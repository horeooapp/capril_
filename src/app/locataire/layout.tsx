import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User } from "lucide-react"

import LocataireLayoutClient from "./layout-client"
import { prisma } from "@/lib/prisma"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (session?.user && session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    // 3. Security: Check onboarding but with extreme robustness
    if (session?.user?.role === "TENANT") {
        try {
            if (!session.user.id) {
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
