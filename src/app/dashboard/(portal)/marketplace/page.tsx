import { getMarketplaceAnnonces } from "@/actions/marketplace-actions"
import MarketplaceDashboardClient from "./marketplace-client"

export default async function MarketplaceDashboardPage() {
    const annonces = await getMarketplaceAnnonces()
    return <MarketplaceDashboardClient initialAnnonces={annonces} />
}
