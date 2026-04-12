import MatchingDashboardClient from "./matching-client"
import { getPendingCandidatures } from "@/actions/matching-actions"

export default async function MatchingDashboardPage() {
    const candidatures = await getPendingCandidatures()
    return <MatchingDashboardClient candidatures={candidatures} />
}
