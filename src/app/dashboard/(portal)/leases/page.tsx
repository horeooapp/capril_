import { getProperties } from "@/actions/properties"
import LeasesClient from "./leases-client"

export default async function LeasesPage() {
    const properties = await getProperties().catch(() => []) as any

    // Flatten leases and inject property info
    const leases = (properties || []).flatMap((prop: any) =>
        (prop.leases || []).map((lease: any) => ({
            ...lease,
            propertyName: prop.address,
            propertyCode: prop.propertyCode,
            propertyCommune: prop.commune
        }))
    )

    return (
        <LeasesClient leases={leases} />
    )
}
