import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import DashboardOverviewClient from "./overview-client"
import RegularizationAlert from "@/components/dashboard/RegularizationAlert"
import { getMonthlyReports } from "@/actions/rapports-mensuels"
import { getDiasporaDashboard } from "@/actions/diaspora-actions"
import { getIntermediaireDashboardData } from "@/actions/intermediaire-actions"
import { DiasporaDashboardData } from "@/types/diaspora"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const [properties, reports, diasporaData, intermData, tenantBail, tenantReceipts] = await Promise.all([
        getProperties() as Promise<any[]>,
        getMonthlyReports(user.id),
        user.diasporaAbonnement ? getDiasporaDashboard() : null,
        user.profileType === "INTERMEDIARY" ? getIntermediaireDashboardData() : null,
        user.role === "TENANT" ? getProperties().then(props => props[0]?.leases?.[0]) : null, 
        [] // Always provide an array for receipts to avoid null mismatch
    ])

    const latestReport = reports[0] || null

    return (
        <DashboardOverviewClient 
            user={user} 
            properties={properties || []}
            latestReport={latestReport}
            regularizationAlert={<RegularizationAlert />}
            diasporaData={diasporaData?.success ? (diasporaData.data as DiasporaDashboardData) : null}
            intermData={intermData}
            tenantData={{ bail: tenantBail, receipts: tenantReceipts }}
        />
    )
}
