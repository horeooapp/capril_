import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import { getCautionBail } from "@/actions/cautions"
import CautionsLocataireClient from "@/components/locataire/CautionsLocataireClient"

export default async function CautionsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") redirect("/auth/login")

    const dashboardData = await getLocataireDashboardData(session.user.id)
    
    // Pour cet exemple, on prend la caution du premier bail actif
    const bailId = dashboardData.bails[0]?.id
    const caution = bailId ? await getCautionBail(bailId) : null

    return (
        <CautionsLocataireClient 
            caution={caution}
            bail={dashboardData.bails[0]}
            userId={session.user.id}
        />
    )
}
