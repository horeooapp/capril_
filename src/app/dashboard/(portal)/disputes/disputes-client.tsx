"use client"

import React, { useState } from "react"
import { 
    Scale, 
    FileWarning, 
    Gavel, 
    FileCheck2, 
    Search, 
    ArrowRight, 
    ShieldAlert, 
    History, 
    KeyRound, 
    AlertTriangle, 
    ShieldX, 
    X, 
    MapPin,
    HeartHandshake,
    CheckCircle2,
    Clock,
    FileText,
    ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createDisputeDLC } from "@/actions/disputes-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function CertifieDisputesClient({ initialDisputes, activeLeases }: { initialDisputes: any[], activeLeases: any[] }) {
    const [isDlcModalOpen, setIsDlcModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("");

    const disputes = initialDisputes

    const filteredDisputes = disputes.filter((d: any) => 
        (d.id || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.hash || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.lease?.tenant?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.lease?.tenant?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.lease?.property?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createDisputeDLC(formData)
        setLoading(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Dossier de litige ouvert et certifié. Un avis officiel a été transmis au locataire.")
            setIsDlcModalOpen(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Gavel size={13} /> Protection Juridique & Recouvrement
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Gestion des Litiges & Impayés
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Suivez les retards de paiement, formalisez les avertissements légaux et préparez les éléments de preuve pour commissaire de justice.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Link 
                        href="/dashboard/mediation" 
                        className="bg-white border text-slate-700 border-slate-200 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <HeartHandshake size={16} className="text-emerald-600" /> Accord Amiable
                    </Link>
                    <button 
                        onClick={() => setIsDlcModalOpen(true)}
                        className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <ShieldAlert size={16} /> Ouvrir un Dossier de Litige
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    label="Dossiers Actifs" 
                    value={disputes.length.toString()} 
                    sub="Total des dossiers enregistrés" 
                />

                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck size={16} /> Preuves Certifiées
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">Horodatage Légal</p>
                        <p className="text-xs text-slate-500 mt-1">Éléments opposables devant les juridictions</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-700 to-rose-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
                    <Gavel className="absolute -right-4 -bottom-4 text-white opacity-10" size={90} />
                    <div className="relative z-10 flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-2">
                        <FileCheck2 size={16} /> Procédures d'Avertissement
                    </div>
                    <div className="relative z-10">
                        <p className="text-3xl font-black text-white">{disputes.filter((d: any) => d.status === 'EVICTION_ORDER').length}</p>
                        <p className="text-xs text-rose-200 mt-1">Dossiers transmis pour exécution</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <SectionCard title="Registre des Dossiers en Cours" noPadding>
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom de locataire ou numéro de dossier..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200">
                                <th className="py-3 px-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">Référence du Dossier</th>
                                <th className="py-3 px-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">Locataire & Logement</th>
                                <th className="py-3 px-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">Montant Réclamé</th>
                                <th className="py-3 px-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">État d'Avancement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDisputes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium text-xs">
                                        Aucun dossier de litige en cours.
                                    </td>
                                </tr>
                            )}
                            {filteredDisputes.map((d: any) => (
                                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                    <td className="py-4 px-5">
                                        <p className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                            {d.severity === 'CRITIQUE' ? <ShieldX size={15} className="text-rose-600"/> : <AlertTriangle size={15} className="text-amber-500"/>}
                                            Dossier N° {d.id.substring(0, 8).toUpperCase()}
                                        </p>
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            Ouvert le {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5">
                                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                                            {d.type?.replace(/_/g, ' ') || 'LITIGE'}
                                        </div>
                                        <p className="text-xs font-bold text-slate-800">{d.lease?.tenant?.firstName} {d.lease?.tenant?.lastName}</p>
                                        <p className="text-[11px] text-slate-500">{d.lease?.property?.name || d.lease?.property?.address || "Logement non précisé"}</p>
                                    </td>
                                    <td className="py-4 px-5">
                                        {d.amountInDispute ? (
                                            <div>
                                                <p className="font-black text-xs text-rose-600">{Number(d.amountInDispute).toLocaleString()} FCFA</p>
                                                {d.monthsDefeated > 0 && (
                                                    <p className="text-[10px] text-slate-400">{d.monthsDefeated} mois en retard</p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-medium">À évaluer</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5">
                                        {d.status === 'EVICTION_ORDER' && (
                                            <Badge color="red">Procédure Commissaire</Badge>
                                        )}
                                        {d.status === 'ESCALATED' && (
                                            <Badge color="rose">Mise en Demeure</Badge>
                                        )}
                                        {d.status === 'OPEN' && (
                                            <Badge color="blue">Dossier Ouvert</Badge>
                                        )}
                                        {d.status !== 'EVICTION_ORDER' && d.status !== 'ESCALATED' && d.status !== 'OPEN' && (
                                            <Badge color="gray">{d.status}</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* OPEN DISPUTE MODAL */}
            {isDlcModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                    <Scale size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Ouvrir un Dossier de Litige ou de Relance
                                    </h2>
                                    <p className="text-xs text-slate-500">Formalisation d'un constat officiel</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsDlcModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl text-xs text-rose-950 space-y-1">
                                    <p className="font-bold text-rose-900 flex items-center gap-1.5">
                                        <AlertTriangle size={14} className="text-rose-600" /> Avertissement officiel
                                    </p>
                                    <p className="leading-relaxed">
                                        L'ouverture de ce dossier génère un avis officiel transmis au locataire. Ce dossier constituera votre pièce maîtresse horodatée si vous devez solliciter un commissaire de justice.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            Contrat de bail concerné <span className="text-rose-500">*</span>
                                        </label>
                                        <select 
                                            name="leaseId" 
                                            required 
                                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="">-- Sélectionnez le bail du locataire --</option>
                                            {activeLeases.map((l: any) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.leaseReference} : {l.tenant?.firstName} {l.tenant?.lastName} ({l.property?.address || l.property?.name || "Logement"})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            Motif principal du litige <span className="text-rose-500">*</span>
                                        </label>
                                        <select 
                                            name="type" 
                                            required 
                                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="DEFAUT_PAIEMENT">Loyers Impayés ou Retards Répétés</option>
                                            <option value="DEGRADATION_LOURDE">Dégradations Constatées dans le Logement</option>
                                            <option value="SOUS_LOCATION_ILLICITE">Sous-location Non Autorisée</option>
                                            <option value="TROUBLES_VOISINAGE">Troubles Graves du Voisinage</option>
                                        </select>
                                    </div>

                                    {/* Plain French Certification */}
                                    <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="isCryptoSealed" 
                                            defaultChecked 
                                            className="mt-1 w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500" 
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">
                                                Certifier et horodater officiellement le dossier
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                Une empreinte numérique certifiée et infalsifiable sera enregistrée pour donner une pleine valeur juridique à votre démarche.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setIsDlcModalOpen(false)} 
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Enregistrement...' : 'Enregistrer le Dossier'}
                                    <ShieldAlert size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
