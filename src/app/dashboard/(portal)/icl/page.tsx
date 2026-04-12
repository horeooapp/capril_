import IclDashboardClient from "./icl-client"
import { getIclProfile } from "@/actions/icl-actions"

export default async function IclDashboardPage() {
    const profile = await getIclProfile()
    return <IclDashboardClient initialProfile={profile} />
}
