"use client"

import React from "react"
import { Users, Presentation, CheckSquare, Calendar, Globe } from "lucide-react"
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function GovernanceDashboardPage() {
    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Presentation className="text-sky-600" size={32} /> Gouvernance & AG
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Plateforme de rassemblement pour les Syndicats de Copropriétaires.
                    </p>
                </div>
            </div>

            <SectionCard noPadding>
                <div className="p-8 pb-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[16px] p-8 md:p-12 text-white relative shadow-md overflow-hidden flex flex-col items-center text-center border border-slate-700">
                        <Globe size={80} className="text-sky-500/10 absolute -top-10 -right-10" />
                        <Calendar size={48} className="text-sky-400 mb-6" />
                        <h2 className="text-2xl font-black mb-4">Assemblée Générale Annuelle</h2>
                        <p className="text-slate-300 text-[13px] font-medium leading-relaxed max-w-2xl mb-8">
                            Organisez vos AG Virtuellement. Convoquez les copropriétaires par email tracé, proposez des résolutions et menez des votes électroniques via QAPRIL avec génération immédiate de PV.
                        </p>
                        <button onClick={() => { toast.loading("Création de l\'espace virtuel AG...", { id: "ag" }); setTimeout(() => toast.success("Module des assemblées synchronisé avec succès !", { id: "ag" }), 1500); }} className="bg-white text-slate-900 px-8 py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shadow-md outline-none">
                            Convoquer Nouvelle AG
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-4">
                         <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-6 shadow-sm">
                             <div className="flex items-center justify-between mb-4">
                                 <h4 className="font-black text-slate-900">Votes en Cours</h4>
                                 <Badge color="amber">Résolution #42</Badge>
                             </div>
                             <p className="text-[13px] font-bold text-slate-600 mb-4">Refection de la toiture Bâtiment A.</p>
                             <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                 <div className="bg-emerald-500 h-2 rounded-full" style={{width: '65%'}}></div>
                             </div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">65% Pour / Quorum Actif</p>
                         </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    )
}
