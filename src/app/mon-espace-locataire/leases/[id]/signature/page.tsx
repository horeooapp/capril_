import { auth } from "@/auth"
import { getLeaseById } from "@/actions/lease.actions"
import { notFound } from "next/navigation"
import LeaseSignatureUI from "@/components/dashboard/LeaseSignatureUI"
import { prisma } from "@/lib/prisma"
import { normalizePhone } from "@/lib/phone"
import Link from "next/link"

export default async function TenantLeaseSignaturePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params
    
    const userId = session?.user?.id
    if (!userId) return null

    const lease = await getLeaseById(id) as any
    if (!lease) notFound()

    // Vérification d'autorisation avec réconciliation automatique par numéro ou email
    const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { phone: true, email: true } 
    });

    const isMatchByPhone = Boolean(user?.phone && lease.tenant?.phone && normalizePhone(user.phone) === normalizePhone(lease.tenant.phone));
    const isMatchByEmail = Boolean(user?.email && lease.tenant?.email && user.email.toLowerCase() === lease.tenant.email.toLowerCase());
    const isOwnerOfLease = lease.tenantId === userId || lease.tenant?.id === userId || isMatchByPhone || isMatchByEmail;

    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN";

    if (!isOwnerOfLease && !isAdmin) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
                <p className="text-rose-800 font-black uppercase text-sm">Accès non autorisé à cette signature</p>
                <p className="text-xs text-rose-600">
                    Ce contrat de bail est attribué à un autre numéro ou compte locataire. Connectez-vous avec le compte destinataire.
                </p>
                <div className="pt-2">
                    <Link href="/mon-espace-locataire" className="text-xs font-bold text-slate-700 underline">
                        Retour à mon espace
                    </Link>
                </div>
            </div>
        );
    }

    // Auto-lier le bail au compte connecté si non encore lié
    if (lease.tenantId !== userId && isOwnerOfLease) {
        await prisma.lease.update({
            where: { id: lease.id },
            data: { tenantId: userId }
        }).catch(() => null);
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <Link 
                    href="/mon-espace-locataire" 
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                    ← Retour à mon tableau de bord
                </Link>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Signature Électronique Certifiée
                </span>
            </div>

            <LeaseSignatureUI leaseId={lease.id} leaseRef={lease.leaseReference} fullLease={lease} />
        </div>
    )
}
