import { auth } from "@/auth"
import { getProperties } from "@/actions/property.actions"
import PropertiesDashboardClient from "./properties-client"

export default async function PropertiesDashboardPage() {
    const properties = await getProperties()
    return <PropertiesDashboardClient initialProperties={properties} />
}
