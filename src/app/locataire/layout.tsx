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

    // Force onboarding for tenants - Check DB as JWT might be stale
    if (session?.user?.role === "TENANT") {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { onboardingComplete: true }
        })

        console.log(`[LOCATAIRE_LAYOUT] User ID: ${session.user.id}, DB onboardingComplete: ${user?.onboardingComplete}`);

        if (!user?.onboardingComplete) {
            console.log(`[LOCATAIRE_LAYOUT] Redirecting to onboarding because DB status is false`);
            redirect("/onboarding/tenant")
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
