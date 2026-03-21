 
import { auth } from "@/auth"
import { getLeaseById } from "@/actions/leases"
import { notFound } from "next/navigation"
import SignatureFlow from "@/components/dashboard/signature/SignatureFlow"

export default async function LandlordLeaseSignaturePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params
    
    const userId = session?.user?.id
    if (!userId) return null

    const lease = await getLeaseById(id) as any
    if (!lease) notFound()

    // Vérifier que c'est bien le propriétaire du bien lié au bail
    if (lease.property?.ownerId !== userId) {
        return <div className="p-8 text-center text-red-600 font-bold uppercase">Accès non autorisé à cette signature.</div>
    }

    return (
        <div className="max-w-5xl mx-auto py-12">
            <SignatureFlow 
                documentId={lease.id} 
                documentType="BAIL" 
                documentRef={lease.leaseReference || "Bail en cours"} 
                signataireId={userId}
                onComplete={() => {
                  window.location.href = `/dashboard/leases/${lease.id}`;
                }}
            />
        </div>
    )
}
