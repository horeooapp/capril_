import { getReconciliations } from "@/actions/reconciliation-actions"
import ReconDashboardClient from "./recon-client"

export default async function ReconciliationDashboardPage() {
    const recons = await getReconciliations()
    return <ReconDashboardClient initialRecons={recons} />
}
