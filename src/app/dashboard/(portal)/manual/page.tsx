import ManualDashboardClient from "./manual-client"
import { getManualUserContext } from "@/actions/manual-actions"

export default async function ManualDashboardPage() {
    const userContext = await getManualUserContext()
    return <ManualDashboardClient userContext={userContext} />
}
