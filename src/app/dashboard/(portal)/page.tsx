import { auth } from "@/auth"
import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import DashboardOverviewClient from "./overview-client"
import RegularizationAlert from "@/components/dashboard/RegularizationAlert"
import { getMonthlyReports } from "@/actions/rapports-mensuels"
import { getDiasporaDashboard } from "@/actions/diaspora-actions"
import { getIntermediaireDashboardData } from "@/actions/intermediaire-actions"
import { getAgencyDashboardData } from "@/actions/agency-actions"
import { DiasporaDashboardData } from "@/types/diaspora"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const session = await auth();
    const user = await getCurrentUser();
    
    if (!user || !session?.user) {
        redirect("/dashboard/login");
    }

    // [FIX DÉFINITIF] Prioritize DB preference (capaciteActive) over Session because cookie updates can lag behind UI.
    const activeRole = (user as any).capaciteActive || (session.user as any).chosenRole || user.role;

    const [properties, reports, diasporaData, intermData, agencyData, tenantBail, tenantReceipts] = await Promise.all([
        getProperties() as Promise<any[]>,
        getMonthlyReports(user.id),
        (activeRole === "DIASPORA" || user.diasporaAbonnement) ? getDiasporaDashboard() : null,
        (activeRole === "INTERMEDIARY" || user.profileType === "INTERMEDIARY") ? getIntermediaireDashboardData() : null,
        (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE'].includes(activeRole) || user.role === "AGENCY") ? getAgencyDashboardData() : null,
        activeRole === "TENANT" ? getProperties().then(props => props[0]?.leases?.[0]) : null, 
        [] // Always provide an array for receipts to avoid null mismatch
    ])

    const latestReport = reports[0] || null

    return (
        <DashboardOverviewClient 
            user={user} 
            activeRole={activeRole}
            session={session!}
            properties={properties || []}
            latestReport={latestReport}
            regularizationAlert={<RegularizationAlert />}
            diasporaData={diasporaData?.success ? (diasporaData.data as DiasporaDashboardData) : null}
            intermData={intermData?.success ? intermData.data : null}
            agencyData={agencyData?.success ? agencyData.data : null}
            tenantData={{ bail: tenantBail, receipts: tenantReceipts }}
        />
    )
}
