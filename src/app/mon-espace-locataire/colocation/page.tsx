import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import ColocationClient from "@/components/locataire/ColocationClient"

export default async function ColocationPage() {
    const session = await auth()
    if (!session?.user) redirect("/mon-espace-locataire/login")

    // Reuse the existing profile action that loads the bails for a tenant
    const dashboardData = await getLocataireDashboardData(session.user.id)

    return (
        <ColocationClient 
            bails={dashboardData.bails}
        />
    )
}
