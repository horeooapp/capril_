import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import { getPreavisLease } from "@/actions/preavis"
import PreavisLocataireClient from "@/components/locataire/PreavisLocataireClient"

export default async function PreavisPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") redirect("/auth/login")

    const dashboardData = await getLocataireDashboardData(session.user.id)
    const activeBail = dashboardData.bails[0]
    
    const preavisList = activeBail ? await getPreavisLease(activeBail.id) : []

    return (
        <PreavisLocataireClient 
            preavisList={preavisList}
            bail={activeBail}
            userId={session.user.id}
        />
    )
}
