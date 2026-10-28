"use client"

import React, { useState, useTransition } from "react"
import { 
    Building2, 
    Users, 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertTriangle, 
    Plus, 
    Landmark, 
    X,
    Coins,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    ArrowRight
} from "lucide-react"
import { toast } from "sonner";
import { createSyndicate, dispatchMilliemes } from "@/actions/syndic-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function SyndicDashboardClient({ initialSyndicates }: { initialSyndicates: any[] }) {
    const [syndicates, setSyndicates] = useState(initialSyndicates)
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)

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
                toast.success("Nouvelle résidence ajoutée avec succès !")
                setIsModalOpen(false)
                window.location.reload()
            }
        })
    }

    return (
        <div className="space-y-8 relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Landmark size={13} className="text-sky-600" /> Vie de l'Immeuble & Copropriété
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Gestion Syndic & Copropriété
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Suivez les comptes de votre immeuble, organisez les réunions des copropriétaires et partagez équitablement les frais communs d'entretien.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2"
                >
                    <Plus size={16} /> Ajouter une Résidence
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Immeubles Gérés" 
                    value={syndicates.length.toString()} 
                    sub="Résidences actives" 
                    trend="up" 
                />
                <StatCard 
                    label="Total des Logements" 
                    value={totalLots.toString()} 
                    sub="Appartements & boutiques" 
                />
                <StatCard 
                    label="Caisse Commune" 
                    value={<>{tr.toLocaleString()} <span className="text-xs font-bold text-slate-400">XOF</span></>} 
                    sub="Fonds disponibles pour l'entretien"
                />
                <StatCard 
                    label="Cotisations en Attente" 
                    value={<>{Math.abs(arrears).toLocaleString()} <span className="text-xs font-bold text-slate-400">XOF</span></>} 
                    sub="Cotisations restantes à percevoir"
                    trend={arrears > 0 ? "down" : undefined}
                />
            </div>

            {/* Residences Table */}
            <SectionCard title="Immeubles et Résidences Enregistrés" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200">
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Nom de la Résidence</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Nombre de Lots</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Trésorerie de la Caisse</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Réunion / Assemblée Générale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syndicates.map((s) => (
                                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-xs text-slate-900 flex items-center gap-2">
                                        <Building2 size={16} className="text-sky-600" />
                                        {s.residenceName}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-600">
                                        {s.properties?.length > 0 ? `${s.properties.length} appartements liés` : `${s.totalLots} appartements déclarés`}
                                    </td>
                                    <td className="p-4 text-xs font-black">
                                        <span className={s.treasuryBalance >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                            {s.treasuryBalance.toLocaleString()} XOF
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
                                    <td colSpan={4} className="p-12 text-center text-slate-400 text-xs font-medium">
                                        Aucune résidence ou copropriété enregistrée pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Automated Distribution Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white relative shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
                <div className="relative z-10 max-w-xl space-y-3">
                    <div className="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-sky-400/30 inline-flex items-center gap-2">
                        <Coins size={13} /> Répartition Automatique & Transparente
                    </div>
                    <h2 className="text-2xl font-black text-white">Partage Équitable des Frais Communs</h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Chaque copropriétaire participe aux dépenses de l'immeuble (gardiennage, électricité des escaliers, entretien de la cour, réparations) au prorata de son appartement. Cliquez pour actualiser les appels de cotisations.
                    </p>
                    <div className="pt-2">
                        <button 
                            type="button" 
                            onClick={() => { 
                                startTransition(async () => { 
                                    toast.loading("Calcul et ventilation des cotisations...", { id: "syndic" }); 
                                    const res = await dispatchMilliemes(); 
                                    if(res.success) toast.success(res.message || "Cotisations réparties avec succès.", { id: "syndic" }); 
                                    else toast.error(res.error, { id: "syndic" }); 
                                }) 
                            }} 
                            disabled={isPending} 
                            className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
                        >
                            Calculer les Quotes-Parts <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
                <Building2 size={160} className="absolute right-0 opacity-10 -translate-y-4 pointer-events-none" />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Ajouter un Immeuble ou une Résidence
                                    </h2>
                                    <p className="text-xs text-slate-500">Configuration de la gestion de copropriété</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                    Nom de la Résidence ou de l'Immeuble <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="residenceName" 
                                    required 
                                    placeholder="Ex: Résidence Les Palmiers, Angré" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Nombre de logements <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        name="totalLots" 
                                        required 
                                        min="1" 
                                        placeholder="Ex: 8" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Appartements ou boutiques</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Fonds en caisse (XOF)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="treasuryBalance" 
                                        defaultValue="0" 
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Solde initial de la réserve</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                    Statut de l'Assemblée Générale annuelle
                                </label>
                                <select 
                                    name="agState" 
                                    defaultValue="Prévue ce trimestre"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                >
                                    <option value="Prévue ce trimestre">Prévue ce trimestre</option>
                                    <option value="Assemblée Validée & Clôturée">Assemblée Validée & Clôturée</option>
                                    <option value="En attente de convocation">En attente de convocation</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-60 shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
                            >
                                {isPending ? 'Enregistrement...' : 'Enregistrer la Résidence'}
                                <CheckCircle2 size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
