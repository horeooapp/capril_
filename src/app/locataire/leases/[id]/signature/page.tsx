 
import { auth } from "@/auth"
import { getLeaseById } from "@/actions/leases"
import { notFound } from "next/navigation"
import LeaseSignatureUI from "@/components/dashboard/LeaseSignatureUI"

export default async function TenantLeaseSignaturePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params
    
    const userId = session?.user?.id
    if (!userId) return null

    const lease = await getLeaseById(id) as any
    if (!lease) notFound()

    // Vérifier que c'est bien le locataire du bail
    if (lease.tenantId !== userId && lease.tenant?.id !== userId) {
        return <div className="p-8 text-center text-red-600 font-bold uppercase">Accès non autorisé à cette signature.</div>
    }

    return (
        <div className="max-w-5xl mx-auto py-12">
            <LeaseSignatureUI leaseId={lease.id} leaseRef={lease.leaseReference} />
        </div>
    )
}
