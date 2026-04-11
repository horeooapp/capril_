import { getCurrentPlan } from "@/actions/billing-actions"
import BillingDashboardClient from "./billing-client"

export default async function BillingDashboardPage() {
    const userPlan = await getCurrentPlan()
    
    return <BillingDashboardClient userPlan={userPlan} />
}
