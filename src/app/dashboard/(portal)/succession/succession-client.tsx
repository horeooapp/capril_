"use client"

import React, { useState } from "react"
import { 
    Users, 
    FileStack, 
    BookOpen, 
    AlertCircle, 
    ArrowRightLeft, 
    ShieldCheck, 
    Milestone, 
    X, 
    FileText, 
    CheckCircle2,
    Heart,
    Calendar,
    Phone,
    UserCheck,
    Check
} from "lucide-react"
import { toast } from "sonner"
import { createSuccession } from "@/actions/succession-actions"

export default function SuccessionDashboardClient({ initialSuccessions, activeLeases }: { initialSuccessions: any[], activeLeases?: any[] }) {
    const successions = initialSuccessions
    const leases = activeLeases || []
    const [isSuccModalOpen, setIsSuccModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createSuccession(formData)
        setLoading(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Dossier de reprise enregistré avec succès. Le contrat de location a été transféré au nouvel ayant droit.")
            setIsSuccModalOpen(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Heart size={13} className="text-rose-500" /> Continuité Familiale du Logement
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Transmission & Continuité du Bail
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Gestion sereine de la reprise des contrats de location par les proches ou ayants droit, pour assurer la continuité du logement en toute conformité.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsSuccModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                        <Users size={16} /> Enregistrer une Reprise de Bail
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dossiers de Reprise</p>
                        <p className="text-2xl font-black text-slate-900">{successions.length}</p>
                        <p className="text-[11px] text-slate-400">Contrats transmis aux ayants droit</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-bold shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dossiers en Vérification</p>
                        <p className="text-2xl font-black text-slate-900">
                            {successions.filter(s => s.statutTransition === 'TRANSITION').length}
                        </p>
                        <p className="text-[11px] text-slate-400">Période transitoire en cours</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4 relative overflow-hidden text-white">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 backdrop-blur-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">Protection du Foyer</p>
                        <p className="text-2xl font-black text-white">Continuité Garantie</p>
                        <p className="text-[11px] text-slate-300">Aucune rupture brutale du logement</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <ArrowRightLeft size={18} className="text-slate-600"/> Historique des Reprises de Contrats
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200">
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">N° de Dossier</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Ancien Titulaire & Logement</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Nouvel Ayant Droit (Bénéficiaire)</th>
                                <th className="p-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Statut du Bail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {successions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-400 font-medium text-xs">
                                        Aucun dossier de succession ou de reprise enregistré.
                                    </td>
                                </tr>
                            )}
                            {successions.map((s) => (
                                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-xs text-slate-900 font-mono">SUCC-{s.id.substring(0,8).toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Enregistré le {new Date(s.createdAt).toLocaleDateString("fr-FR")}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-xs text-slate-800">{s.deceasedName}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{s.propertyInfo || "Logement rattaché"}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-xs text-slate-900">{s.claimantName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                {s.relation}
                                            </span>
                                            {s.notaire && (
                                                <span className="text-[10px] text-slate-400">• Étude : {s.notaire}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-[11px] font-bold rounded-full">
                                            <CheckCircle2 size={13} className="text-emerald-600"/> Contrat Transféré
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isSuccModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                                    <Users size={20}/>
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Enregistrer la Reprise d'un Bail
                                    </h2>
                                    <p className="text-xs text-slate-500">Transfert du contrat de location à un ayant droit</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSuccModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-1">
                                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-slate-700" /> Cadre protecteur de la loi
                                    </p>
                                    <p className="leading-relaxed">
                                        En cas de décès du locataire titulaire, le bail n'est pas rompu : il continue au profit du conjoint ou des descendants directs vivant avec lui. Ce formulaire permet de régulariser la titularité du contrat.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Lease */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            Contrat de bail du titulaire précédent <span className="text-rose-500">*</span>
                                        </label>
                                        <select 
                                            name="leaseId" 
                                            required 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                        >
                                            <option value="">-- Sélectionnez le contrat de bail concerné --</option>
                                            {leases.map((l: any) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.tenant?.firstName} {l.tenant?.lastName} ({l.property?.address || l.property?.propertyCode || "Logement"})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Beneficiary Name & Date */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                Nom du nouvel ayant droit (Repreneur) <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="beneficiaireExtNom" 
                                                required 
                                                placeholder="Ex: Kouamé Affoué Marie" 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                Date de survenance de l'événement <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="date" 
                                                name="dateDeces" 
                                                required 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Declarant Type & Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                Qualité du déclarant <span className="text-rose-500">*</span>
                                            </label>
                                            <select 
                                                name="declarantType" 
                                                required 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            >
                                                <option value="Conjoint survivant">Conjoint survivant</option>
                                                <option value="Enfant / Descendant direct">Enfant / Descendant direct</option>
                                                <option value="Parent proche">Autre parent direct</option>
                                                <option value="Étude notariale">Cabinet notarial / Représentant légal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                Téléphone de contact <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="tel" 
                                                name="declarantPhone" 
                                                required 
                                                placeholder="Ex: +225 07 00 00 00 00" 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Notary optional */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            Étude notariale ou liquidateur en charge (Optionnel)
                                        </label>
                                        <input 
                                            type="text" 
                                            name="notaire" 
                                            placeholder="Ex: Étude de Maître Bamba, Cocody" 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setIsSuccModalOpen(false)} 
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Enregistrement...' : 'Valider la Continuité du Bail'}
                                    <CheckCircle2 size={14}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
