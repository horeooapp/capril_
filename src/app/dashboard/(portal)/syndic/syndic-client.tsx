"use client"

import React, { useState, useTransition } from "react"
import { Building2, Users, FileText, CheckCircle, Clock, AlertTriangle, Plus, Landmark, X } from "lucide-react"
import { toast } from "sonner";
import { createSyndicate, dispatchMilliemes } from "@/actions/syndic-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function SyndicDashboardClient({ initialSyndicates }: { initialSyndicates: any[] }) {
    const [syndicates, setSyndicates] = useState(initialSyndicates)
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Calcul basé sur les éléments en base (soit les lots définis manuellement, soit le compte réel des lots liés)
    const totalLots = syndicates.reduce((acc, s) => acc + (s.properties?.length || s.totalLots), 0)
    const tr = syndicates.reduce((acc, s) => acc + s.treasuryBalance, 0)
    const arrears = syndicates.filter(s => s.treasuryBalance < 0).reduce((acc, s) => acc + s.treasuryBalance, 0)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await createSyndicate(formData)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Nouvelle Copropriété activée.")
                setIsModalOpen(false)
                window.location.reload()
            }
        })
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-sky-600" size={32} /> Gestion Syndic
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Assemblées générales, appels de fonds et répartition des quotes-parts.
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-slate-800 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> Nouvelle Résidence
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard 
                    label="Résidences Gérées" 
                    value={syndicates.length.toString()} 
                    sub="Actives" 
                    trend="up" 
                 />
                 <StatCard 
                    label="Lots (Copro)" 
                    value={totalLots.toString()} 
                    sub="Cumul des immeubles" 
                 />
                 <StatCard 
                    label="Trésorerie Actuelle" 
                    value={<>{tr.toLocaleString()} <span className="text-[14px]">FCFA</span></>} 
                    sub="Fonds de roulement global"
                 />
                 <StatCard 
                    label="Arriérés Syndic" 
                    value={<>{Math.abs(arrears).toLocaleString()} <span className="text-[14px]">FCFA</span></>} 
                    sub="Déficits cumulés"
                    trend={arrears > 0 ? "down" : undefined}
                 />
            </div>

            <SectionCard title="Assemblées & Immeubles" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Copropriété</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Lots</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Trésorerie Associée</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Dernière AG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syndicates.map((s) => (
                                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-[13.5px] text-slate-900">{s.residenceName}</td>
                                    <td className="p-4 text-[13px] font-bold text-slate-600">{s.properties?.length > 0 ? `${s.properties.length} (Liés)` : `${s.totalLots} (Déclarés)`}</td>
                                    <td className="p-4 text-[13px] font-black">
                                        <span className={s.treasuryBalance >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                            {s.treasuryBalance.toLocaleString()} FCFA
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Badge color={
                                            s.agState.includes("Validée") ? "emerald" :
                                            s.agState.includes("Souffrance") ? "rose" :
                                            "amber"
                                        }>
                                            {s.agState}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {syndicates.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500 text-[13px] font-medium">
                                        Aucune résidence ou copropriété en gestion.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[16px] p-8 md:p-10 text-white relative shadow-md overflow-hidden flex flex-col md:flex-row items-center justify-between border border-slate-700">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-sky-500/20 text-sky-300 px-3 py-1.5 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border border-sky-400/30 inline-flex items-center gap-2 mb-4">
                        Moteur de Tantièmes
                    </div>
                    <h2 className="text-2xl font-black mb-3">Répartition Automatique des Charges</h2>
                    <p className="text-slate-300 text-[13px] leading-relaxed mb-6">Le moteur de tantièmes ventile automatiquement les déficits et génère les appels de fonds sur les fiches de paramétrage de chaques lots liés.</p>
                    <button type="button" onClick={() => { startTransition(async () => { toast.loading("Calcul des tantièmes en cours...", { id: "syndic" }); const res = await dispatchMilliemes(); if(res.success) toast.success(res.message || "Millièmes ventilés aux copropriétaires.", { id: "syndic" }); else toast.error(res.error, { id: "syndic" }); }) }} disabled={isPending} className="bg-white text-slate-900 px-5 py-2.5 rounded-[8px] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-75">
                        Lancer le Moteur
                    </button>
                </div>
                <Building2 size={160} className="absolute right-0 opacity-[0.03] -translate-y-4 pointer-events-none" />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[16px] w-full max-w-md shadow-xl overflow-hidden flex flex-col border border-slate-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-[15px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Landmark size={20} className="text-sky-600"/> Nouvelle Copropriété
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nom de la Résidence</label>
                                <input type="text" name="residenceName" required placeholder="Ex: Tour Horizon" className="w-full p-2.5 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nombre de Lots</label>
                                    <input type="number" name="totalLots" required min="1" placeholder="Ex: 12" className="w-full p-2.5 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Trésorerie Initiale</label>
                                    <input type="number" name="treasuryBalance" defaultValue="0" className="w-full p-2.5 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"/>
                                </div>
                            </div>
                            <button type="submit" disabled={isPending} className="w-full mt-2 bg-slate-800 text-white px-5 py-3 rounded-[8px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-60 shadow-sm">
                                {isPending ? 'CRÉATION EN COURS...' : 'ENREGISTRER LE SYNDIC'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
