import { getAvailableProperties } from "@/actions/marketplace-actions"
import NewAnnonceClient from "./new-annonce-client"

export const metadata = {
    title: "Créer une Annonce | QAPRIL Marketplace",
}

export default async function NewMarketplaceAnnoncePage() {
    const properties = await getAvailableProperties()
    return <NewAnnonceClient properties={properties} />
}
