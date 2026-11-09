import { getReceiptsForTenant } from "@/actions/receipt.actions"
import { getTenantDashboard } from "@/actions/tenant-actions"
import { redirect } from "next/navigation"
import ReceiptsContent from "./ReceiptsContent"

export const dynamic = "force-dynamic"

export default async function TenantReceiptsPage() {
    const receipts = await getReceiptsForTenant()
    const dashboard = await getTenantDashboard()

    const lease = (dashboard?.success && dashboard?.lease) 
        ? dashboard.lease 
        : { 
            id: "", 
            computedStatus: "AUCUN_BAIL", 
            totalArrears: 0, 
            rentAmount: 0 
        }

    return (
        <ReceiptsContent 
            receipts={receipts || []} 
            lease={lease} 
        />
    )
}
