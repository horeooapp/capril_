import { getReceiptsForTenant } from "@/actions/receipt.actions"
import { getTenantDashboard } from "@/actions/tenant-actions"
import { redirect } from "next/navigation"
import ReceiptsContent from "./ReceiptsContent"

export const dynamic = "force-dynamic"

export default async function TenantReceiptsPage() {
    const receipts = await getReceiptsForTenant()
    const dashboard = await getTenantDashboard()
    
    if (!dashboard.success || !dashboard.hasLease) {
        redirect("/mon-espace-locataire")
    }

    const lease = dashboard.lease as any

    return (
        <ReceiptsContent 
            receipts={receipts} 
            lease={lease} 
        />
    )
}
