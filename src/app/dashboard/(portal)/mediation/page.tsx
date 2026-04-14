import React from "react"
import { Scale, Users, Gavel, Search, Settings, ArrowRight, Handshake } from "lucide-react"
import { getMediationStats } from "@/actions/mediation-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import Link from "next/link"

export default async function MediationDashboardPage() {
    const stats = await getMediationStats()

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Handshake size={12} /> Procédures Amiables
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Scale className="text-indigo-600" size={32} /> Médiation
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Résolution amiable, recouvrement forcé et suivi des huissiers.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Link 
                        href="/dashboard/disputes" 
                        className="bg-white border text-slate-700 border-slate-200 px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <ArrowRight size={16} /> Contentieux (CACI)
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-4 flex flex-col justify-center text-center group h-full">
                     <p className="text-[10.5px] font-bold text-rose-700 uppercase tracking-widest">Procédures en cours</p>
                     <p className="text-3xl font-black text-rose-600 mt-1">{stats.ongoing}</p>
                 </div>
                 
                 <StatCard 
                     label="Conciliations Réussies" 
                     value={stats.resolved.toString()} 
                     sub="Dossiers clôturés" 
                 />

                 <div className="bg-slate-800 border border-slate-700 rounded-[10px] p-4 shadow-sm text-center text-white cursor-pointer hover:bg-slate-700 transition-all flex flex-col items-center justify-center h-full">
                     <Gavel size={24} className="mb-2 opacity-60 text-indigo-300"/>
                     <p className="text-[11px] font-bold uppercase tracking-widest">Mandater un Huissier</p>
                 </div>
            </div>

            <SectionCard title="État du Réseau Amiable">
                {stats.ongoing === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                        <Scale size={48} className="text-emerald-500 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">Aucun litige critique récent</h3>
                        <p className="text-[13px] font-medium text-slate-500 max-w-md">
                            Merveilleux ! L'écosystème QAPRIL a réussi à recouvrer préventivement vos quittances. Vous n'avez aucune assignation ou médiation en cours.
                        </p>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center text-center py-8">
                        <Gavel size={48} className="text-rose-500 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">Dossiers d'Arbitrage Actifs</h3>
                        <p className="text-[13px] font-medium text-slate-500 max-w-md">
                            Vous avez <span className="font-bold text-rose-600">{stats.ongoing}</span> dossier(s) en médiation amiable.
                        </p>
                    </div>
                )}
            </SectionCard>
        </div>
    )
}
