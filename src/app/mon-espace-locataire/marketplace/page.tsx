import React from "react"
import { getPublicMarketplaceAnnonces } from "@/actions/marketplace-actions"
import { serializeObject } from "@/lib/serialize"
import MarketplaceTenantClient from "./marketplace-tenant-client"

export const metadata = {
    title: "Marketplace Immobilière • QAPRIL",
    description: "Trouvez votre prochain logement mis en location par les propriétaires certifiés QAPRIL."
}

export default async function TenantMarketplacePage() {
    const annonces = await getPublicMarketplaceAnnonces()
    return <MarketplaceTenantClient initialAnnonces={serializeObject(annonces)} />
}
