import { getLeaseById } from "@/actions/lease.actions"
import { notFound } from "next/navigation"
import LeaseEditClient from "./LeaseEditClient"

export default async function LeaseEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const lease = await getLeaseById(id)
    
    if (!lease || lease.error) {
        notFound()
    }

    return <LeaseEditClient initialLease={lease} />
}
