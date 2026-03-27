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

    const dashboardData = await getLocataireDashboardData(session.user.id)

    return (
        <DashboardLocataireV2 
            data={dashboardData} 
            session={session} 
        />
    )
}
