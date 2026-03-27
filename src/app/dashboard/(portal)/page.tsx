import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import DashboardOverviewClient from "./overview-client"
import RegularizationAlert from "@/components/dashboard/RegularizationAlert"
import { getMonthlyReports } from "@/actions/rapports-mensuels"
import { getDiasporaDashboard } from "@/actions/diaspora-actions"
import { DiasporaDashboardData } from "@/types/diaspora"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const [properties, reports, diasporaData] = await Promise.all([
        getProperties() as Promise<any[]>,
        getMonthlyReports(user.id),
        user.diasporaAbonnement ? getDiasporaDashboard() : null
    ])

    const latestReport = reports[0] || null

    return (
        <DashboardOverviewClient 
            user={user} 
            properties={properties || []}
            latestReport={latestReport}
            regularizationAlert={<RegularizationAlert />}
            diasporaData={diasporaData?.success ? (diasporaData.data as DiasporaDashboardData) : null}
        />
    )
}
