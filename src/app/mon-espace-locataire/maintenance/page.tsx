import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Wrench, ShieldCheck, MessageSquare } from "lucide-react"
import DeclareIncidentForm from "@/components/tenant/DeclareIncidentForm"

export const dynamic = "force-dynamic"

export default async function TenantMaintenancePage() {
    const session = await auth()
    
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (!session?.user || activeRole !== "TENANT") {
        redirect("/mon-espace-locataire/login")
    }

    const data = await getTenantDashboard()
    
    if (!data.success || !data.hasLease) {
        redirect("/mon-espace-locataire")
    }

    const lease = data.lease as any
    const landlordName = lease?.landlord?.firstName 
        ? `${lease.landlord.firstName} ${lease.landlord.lastName || ''}` 
        : "votre propriétaire";

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/mon-espace-locataire" className="w-10 h-10 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all">
                    <ArrowLeft size={20} className="text-qnavy" />
                </Link>
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider mb-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        ÉMISSION DU LOCATAIRE → BAILLEUR (RG-MAI-01)
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-qnavy-dark uppercase tracking-tighter">
                        Émettre un signalement d'incident
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-qtext-light">
                        Preuves contradictoires horodatées SHA-256 (ADD-11)
                    </p>
                </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-6 rounded-[1.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-lg">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20 mt-1 sm:mt-0">
                        <Wrench size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-white">
                            Destinataire notifié : {landlordName}
                        </p>
                        <p className="text-xs font-medium text-white/80 leading-relaxed max-w-xl">
                            En tant que locataire, vous émettez les déclarations d'incidents (plomberie, électricité, serrure). Votre bailleur les reçoit directement sur son tableau de bord pour validation et intervention.
                        </p>
                    </div>
                </div>
                <Link
                    href="/mon-espace-locataire/messages"
                    className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                    <MessageSquare size={14} className="text-amber-600" />
                    <span>Contacter le bailleur</span>
                </Link>
            </div>

            <DeclareIncidentForm leaseId={lease.id} propertyId={lease.propertyId} />
        </div>
    )
}
