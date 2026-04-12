import GeoRadarDashboardClient from "./observatory-client"
import { getMapProperties } from "@/actions/observatory-actions"

export default async function GeoRadarDashboardPage() {
    const properties = await getMapProperties()
    return <GeoRadarDashboardClient properties={properties} />
}
