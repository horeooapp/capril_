import GeoRadarDashboardClient from "./observatory-client"
import { getMapProperties, getObservatorySummary } from "@/actions/observatory-actions"

export default async function GeoRadarDashboardPage() {
    const [properties, summary] = await Promise.all([
        getMapProperties(),
        getObservatorySummary()
    ])
    return <GeoRadarDashboardClient properties={properties} summary={summary} />
}

