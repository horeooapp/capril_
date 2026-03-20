import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardLayoutClient from "./layout-client"
import MarketTickerAI from "@/components/MarketTickerAI"

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

    if (session.user.role === "TENANT") {
        redirect("/locataire")
    }

    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
        redirect("/admin")
    }

    return (
        <>
            <DashboardLayoutClient session={session}>
                {children}
            </DashboardLayoutClient>
            <MarketTickerAI />
        </>
    )
}
