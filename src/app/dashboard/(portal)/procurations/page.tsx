import ProcurationDashboardClient from "./procurations-client"
import { getProcurations } from "@/actions/procuration-actions"

export default async function ProcurationsDashboardPage() {
    const procurations = await getProcurations()
    return <ProcurationDashboardClient initialProcurations={procurations} />
}

