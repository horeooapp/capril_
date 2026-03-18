import { getProperties } from "@/actions/properties"
import { getCurrentUser } from "@/actions/users"
import DashboardOverviewClient from "./overview-client"
import RegularizationAlert from "@/components/dashboard/RegularizationAlert"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const user = await getCurrentUser()
    const properties = await getProperties() as any

    return (
        <DashboardOverviewClient 
            user={user} 
            properties={properties || []}
            regularizationAlert={<RegularizationAlert />}
        />
    )
}
