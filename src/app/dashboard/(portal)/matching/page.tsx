import MatchingDashboardClient from "./matching-client"
import { getPendingCandidatures, getAcceptedCandidatures } from "@/actions/matching-actions"

export default async function MatchingDashboardPage() {
    const [candidatures, acceptedCandidatures] = await Promise.all([
        getPendingCandidatures(),
        getAcceptedCandidatures()
    ])
    return <MatchingDashboardClient candidatures={candidatures} acceptedCandidatures={acceptedCandidatures} />
}
