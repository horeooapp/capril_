import SyndicationDashboardClient from "./syndication-client"
import { getMarketplaceAnnonces } from "@/actions/marketplace-actions"

export default async function SyndicationDashboardPage() {
    const annonces = await getMarketplaceAnnonces()
    return <SyndicationDashboardClient annonces={annonces} />
}
