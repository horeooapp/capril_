import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import DashboardLocataireClient from "@/components/locataire/DashboardLocataireClient"

export const dynamic = "force-dynamic"

export default async function LocataireDashboardPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    const dashboardData = await getLocataireDashboardData(session.user.id)

    return (
        <DashboardLocataireClient 
            data={dashboardData} 
            session={session} 
        />
    )
}
