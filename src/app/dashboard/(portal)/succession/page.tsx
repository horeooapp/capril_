import { getSuccessions } from "@/actions/succession-actions"
import SuccessionDashboardClient from "./succession-client"

export default async function SuccessionDashboardPage() {
    const successions = await getSuccessions()
    return <SuccessionDashboardClient initialSuccessions={successions} />
}
