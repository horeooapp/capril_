import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData, refreshLocataireScore } from "@/actions/locataire-profile"
import TrustLocataireClient from "@/components/locataire/TrustLocataireClient"

export const dynamic = "force-dynamic"

export default async function LocataireTrustPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/auth/login")
    }

    // On s'assure que le score est à jour
    await refreshLocataireScore(session.user.id)
    const dashboardData = await getLocataireDashboardData(session.user.id)

    return (
        <TrustLocataireClient 
            profile={dashboardData.profile}
        />
    )
}
