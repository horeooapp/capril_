import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import DashboardOverviewClient from "./overview-client"

export default async function DashboardPage() {
    const user = await getCurrentUser()
    const properties = await getProperties() as any

    return (
        <DashboardOverviewClient 
            user={user} 
            properties={properties || []} 
        />
    )
}
