import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Wrench, ShieldCheck, MessageSquare } from "lucide-react"
import DeclareIncidentForm from "@/components/tenant/DeclareIncidentForm"

export const dynamic = "force-dynamic"

export default async function TenantMaintenancePage() {
    const session = await auth()
    
    if (!session?.user) {
        redirect("/mon-espace-locataire/login")
    }

    const data = await getTenantDashboard()
    
    if (!data.success || !data.hasLease) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
                    <Wrench size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Signalement d'incidents</h1>
                <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                    Pour signaler une panne (plomberie, électricité, étanchéité) et notifier officiellement votre bailleur, votre contrat de bail doit être validé.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link
                        href="/valider-bail"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                        Valider mon code de bail
                    </Link>
                    <Link
                        href="/mon-espace-locataire"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
                    >
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        )
    }

    const lease = data.lease as any
    const landlordName = lease?.landlord?.firstName 
        ? `${lease.landlord.firstName} ${lease.landlord.lastName || ''}` 
        : "votre propriétaire";

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/mon-espace-locataire" className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-xs">
                    <ArrowLeft size={20} className="text-slate-800" />
                </Link>
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider mb-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        CANAL OFFICIEL LOCATAIRE → PROPRIÉTAIRE
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        Émettre un signalement d'incident
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Preuves contradictoires horodatées et certifiées
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-lg border border-slate-800">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20 mt-1 sm:mt-0 text-amber-400">
                        <Wrench size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-white">
                            Destinataire notifié : {landlordName}
                        </p>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed max-w-xl">
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
