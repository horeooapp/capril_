import { getMarketplaceAnnonces } from "@/actions/marketplace-actions"
import MarketplaceDashboardClient from "./marketplace-client"
import { auth } from "@/auth"

export default async function MarketplaceDashboardPage() {
    const session = await auth()
    const annonces = await getMarketplaceAnnonces()
    return <MarketplaceDashboardClient initialAnnonces={annonces} agencyId={session?.user?.id || 'my-agency'} />
}
