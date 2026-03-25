import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User } from "lucide-react"

import LocataireLayoutClient from "./layout-client"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (session?.user && session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    // Force onboarding for tenants
    if (session?.user?.role === "TENANT" && !session.user.onboardingComplete) {
        redirect("/onboarding/tenant")
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
