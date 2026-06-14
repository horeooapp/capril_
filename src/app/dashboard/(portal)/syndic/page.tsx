import { getSyndicates } from "@/actions/syndic-actions"
import { prisma } from "@/lib/prisma"
import SyndicDashboardClient from "./syndic-client"

export default async function SyndicDashboardPage() {
    let syndicates = await getSyndicates()



    return <SyndicDashboardClient initialSyndicates={syndicates} />
}
