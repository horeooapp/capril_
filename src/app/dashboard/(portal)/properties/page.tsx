import { getProperties } from "@/actions/properties"
import PropertiesClient from "./properties-client"

export default async function PropertiesPage() {
    const properties = await getProperties().catch(() => []) as any

    return (
        <PropertiesClient properties={properties || []} />
    )
}
