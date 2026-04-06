import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ShieldCheck, MessageSquareWarning, FileSignature, Receipt, Gavel, FileLock2, Info } from "lucide-react"
import { RightsActionManager } from "@/components/dashboard/tenant/RightsActionManager"

export const dynamic = "force-dynamic"

export default async function TenantRightsPage() {
    const session = await auth()
    
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    
    if (!session?.user || activeRole !== "TENANT") {
        redirect("/locataire/login")
    }



    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* V4 Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10 w-full">
                    <h1 className="text-3xl sm:text-4xl font-black text-[#97782A] uppercase tracking-tighter flex items-center gap-3">
                        <Gavel className="mb-1" size={32} /> Mes Droits 
                        <span className="bg-[#97782A]/10 text-[#97782A] text-[10px] px-3 py-1 rounded-full tracking-widest font-black uppercase border border-[#97782A]/30">Assistance Juridique</span>
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-widest text-qtext-light mt-2">
                        Création et suivi de vos requêtes locataires
                    </p>
                </div>
            </div>

            {/* Educational Banner */}
            <div className="bg-[linear-gradient(135deg,#FDF6E3_0%,#F5E6BE_100%)] p-8 rounded-[2rem] border border-[#C9A84C]/20 shadow-sm relative overflow-hidden group">
                <div className="flex items-start gap-4 z-10 relative">
                    <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/50 shrink-0 mt-1">
                        <ShieldCheck className="text-[#C9A84C]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#97782A] uppercase tracking-widest leading-tight mb-2">
                            Assistance & Médiation QAPRIL
                        </h3>
                        <p className="text-sm font-bold text-[#97782A]/80 leading-relaxed max-w-2xl">
                            La plateforme agit comme un tiers de confiance. Lorsqu'un ticket est ouvert, votre bailleur dispose d'un temps imparti pour répondre. Sans réponse, <span className="font-black text-qred-dark bg-qred/10 px-1 rounded">le ticket sera fermé en votre faveur</span> et affectera automatiquement son Indice de Confiance (ICL).
                        </p>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <ShieldCheck size={200} />
                </div>
            </div>

            {/* Actions Grid */}
            <RightsActionManager />

            {/* Active Tickets Simulation */}
            <div className="mt-12">
                 <h2 className="text-md font-black text-qtext-light mb-6 uppercase tracking-widest">Historique de vos dossiers</h2>
                 <div className="bg-white rounded-[2rem] border border-qgrey-2 border-dashed p-10 text-center">
                     <p className="text-sm font-bold text-qtext-mid">Aucun dossier d'assistance en cours.</p>
                     <p className="text-xs text-qtext-light mt-1">Vos réclamations et préavis s'afficheront ici.</p>
                 </div>
            </div>
            
        </div>
    )
}
