"use client"

import React, { useState, useTransition } from "react"
import { Building2, Users, FileText, CheckCircle, Clock, AlertTriangle, Plus, Landmark, X } from "lucide-react"
import { toast } from "sonner";
import { createSyndicate, dispatchMilliemes } from "@/actions/syndic-actions"

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-qblue" size={32} /> Gestion Syndic
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Assemblées générales, appels de fonds et répartition des quotes-parts.
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Nouvelle Résidence
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <Building2 className="text-qgrey-2 mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Résidences Gérées</p>
                        <p className="text-3xl font-black text-qnavy-dark">{syndicates.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <Users className="text-qblue mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Lots (Copro)</p>
                        <p className="text-3xl font-black text-qnavy-dark">{totalLots}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <FileText className="text-qorange mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Trésorerie Actuelle</p>
                        <p className="text-3xl font-black text-qnavy-dark">{tr.toLocaleString()} <span className="text-sm">FCFA</span></p>
                    </div>
                </div>
                <div className="bg-qred-pale p-6 rounded-3xl border border-qred/20 shadow-sm flex flex-col justify-between">
                    <AlertTriangle className="text-qred mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qred-dark uppercase tracking-widest mb-1">Arriérés Syndic</p>
                        <p className="text-3xl font-black text-qred">{Math.abs(arrears).toLocaleString()} <span className="text-sm">FCFA</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Assemblées & Immeubles</h3>
                </div>
                
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Copropriété</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Lots</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Trésorerie Associée</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Dernière AG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {syndicates.map((s) => (
                            <tr key={s.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                                <td className="p-5 font-bold text-sm text-qnavy-dark">{s.residenceName}</td>
                                <td className="p-5 text-sm font-black text-qnavy">{s.properties?.length > 0 ? `${s.properties.length} (Liés)` : `${s.totalLots} (Déclarés)`}</td>
                                <td className="p-5 text-sm font-black">
                                    <span className={s.treasuryBalance >= 0 ? "text-qgreen" : "text-qred"}>
                                        {s.treasuryBalance.toLocaleString()} FCFA
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                        s.agState.includes("Validée") ? "bg-qgreen-pale text-qgreen" :
                                        s.agState.includes("Souffrance") ? "bg-qred-pale text-qred" :
                                        "bg-qorange-pale text-qorange"
                                    }`}>
                                        {s.agState}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-lg overflow-hidden flex flex-col md:flex-row items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-blue-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-400/30 inline-block mb-4">Moteur de Tantièmes</div>
                    <h2 className="text-2xl font-black mb-3">Répartition Automatique des Charges</h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">Le moteur de tantièmes ventile automatiquement les déficits et génère les appels de fonds sur les fiches de paramétrage de chaques lots (Biens) liés.</p>
                    <button type="button" onClick={() => { startTransition(async () => { toast.loading("Calcul des tantièmes en cours...", { id: "syndic" }); const res = await dispatchMilliemes(); if(res.success) toast.success(res.message || "Millièmes ventilés aux copropriétaires.", { id: "syndic" }); else toast.error(res.error, { id: "syndic" }); }) }} disabled={isPending} className="bg-white text-qnavy px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                        Lancer le Moteur
                    </button>
                </div>
                <Building2 size={160} className="absolute right-0 opacity-10 -translate-y-4 pointer-events-none" />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qnavy/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center">
                            <h2 className="text-lg font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-2">
                                <Landmark size={20}/> Nouvelle Copropriété
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-qtext-light hover:text-qnavy transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Nom de la Résidence</label>
                                <input type="text" name="residenceName" required placeholder="Ex: Tour Horizon" className="w-full p-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:outline-none focus:border-qnavy"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Nombre de Lots</label>
                                    <input type="number" name="totalLots" required min="1" placeholder="Ex: 12" className="w-full p-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:outline-none focus:border-qnavy"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Trésorerie Initiale</label>
                                    <input type="number" name="treasuryBalance" defaultValue="0" className="w-full p-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy focus:outline-none focus:border-qnavy"/>
                                </div>
                            </div>
                            <button type="submit" disabled={isPending} className="w-full mt-4 bg-qnavy text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all disabled:opacity-50">
                                {isPending ? 'CRÉATION...' : 'ENREGISTRER LE SYNDIC'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
