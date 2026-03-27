import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import DashboardLocataireV2 from "@/components/locataire/DashboardLocataireV2"

export const dynamic = "force-dynamic"

export default async function LocataireDashboardPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    // Guard: should never happen if session is valid, but prevents Prisma crash
    const userId = session.user.id
    if (!userId) {
        redirect("/locataire/login")
    }

    let dashboardData: any = null
    try {
        dashboardData = await getLocataireDashboardData(userId)
    } catch (err) {
        console.error("[LOCATAIRE_PAGE] Failed to load dashboard data:", err)
        // Fallback empty state — dashboard will show graceful empty UI
        dashboardData = {
            profile: { scoreActuel: 0, scoreBadge: "D", tauxPaiement12m: 0 },
            bails: [],
            caution: null,
            quittances: [],
            currentReceipt: null,
            facturesUtilities: [],
            mobileMoney: [],
            nextPaymentInDays: 0,
            expectedPaymentDate: new Date().toISOString(),
        }
    }

    return (
        <DashboardLocataireV2 
            data={dashboardData} 
            session={session} 
        />
    )
}
