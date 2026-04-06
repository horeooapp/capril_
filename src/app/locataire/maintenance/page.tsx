import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import DeclareIncidentForm from "@/components/tenant/DeclareIncidentForm"

export const dynamic = "force-dynamic"

export default async function TenantMaintenancePage() {
    const session = await auth()
    
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (!session?.user || activeRole !== "TENANT") {
        redirect("/locataire/login")
    }

    const data = await getTenantDashboard()
    
    if (!data.success || !data.hasLease) {
        redirect("/locataire")
    }

    const lease = data.lease as any

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/locataire" className="w-10 h-10 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all">
                    <ArrowLeft size={20} className="text-qnavy" />
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-qnavy-dark uppercase tracking-tighter">
                        Assistance & Maintenance
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">
                        Déclarer un incident sur votre bien
                    </p>
                </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-6 rounded-[1.5rem] flex items-start sm:items-center gap-4 text-white shadow-lg">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20 mt-1 sm:mt-0">
                    <AlertCircle size={20} />
                </div>
                <p className="text-xs font-medium text-white/80 leading-relaxed">
                    Tout signalement d'incident est directement transmis à votre propriétaire/agence. 
                    Ajoutez des photos pour accélérer la prise en charge par les professionnels (plombier, électricien...).
                </p>
            </div>

            <DeclareIncidentForm leaseId={lease.id} propertyId={lease.propertyId} />
        </div>
    )
}
