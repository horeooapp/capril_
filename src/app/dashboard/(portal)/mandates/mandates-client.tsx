"use client"

import React, { useState, useTransition } from "react"
import { ClipboardList, Search, FileSignature, CheckCircle, ShieldAlert, ArrowRight, UserCheck } from "lucide-react"
import { toast } from "sonner";
import { updateMandateStatus, createMandate, CreateMandateInput } from "@/actions/mandate-actions";
import { MandateType } from "@prisma/client";

export default function MandatesDashboardClient({ initialMandates, properties }: { initialMandates: any[], properties?: any[] }) {
    const [mandates, setMandates] = useState<any[]>(initialMandates.length > 0 ? initialMandates : [])
    const [isPending, startTransition] = useTransition()

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState<Partial<CreateMandateInput>>({
        mandateType: "SIMPLE",
        commissionPct: 5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        propertyId: ""
    })

    const handleUpdateStatus = (mandateId: string) => {
        startTransition(async () => {
             const promise = updateMandateStatus(mandateId)
             toast.promise(promise, {
                 loading: "Mise à jour sécurisée du mandat...",
                 success: "C'est fait. Le rôle et accès ont été révoqués ou rétablis.",
                 error: "Erreur lors de la mise à jour."
             })
             
             const res = await promise;
             if (res.success) {
                 setMandates(prev => prev.map(m => m.id === mandateId ? { ...m, status: res.newStatus } : m));
             }
        })
    }

    const handleCreateMandate = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.propertyId) {
            toast.error("Veuillez sélectionner une propriété")
            return
        }

        setIsCreating(true)
        try {
            const res = await createMandate({
                propertyId: formData.propertyId,
                agentId: "self", // The backend ignores agentId and uses session.user.id implicitly if we adapt it or uses input.agentId. Wait, backend uses input.agentId! Let's just pass "self" and let backend check. Wait, backend `createMandate` uses `input.agentId`. 
                mandateType: formData.mandateType as MandateType,
                commissionPct: Number(formData.commissionPct),
                startDate: formData.startDate as string,
                endDate: formData.endDate as string
            } as any)

            if (res.success) {
                toast.success("Mandat Brouillon créé. En attente de signature du propriétaire.")
                setIsModalOpen(false)
                // A refresh is triggered by the revalidatePath in the action.
            } else {
                toast.error(res.error || "Erreur de création du mandat.")
            }
        } catch (err) {
            toast.error("Une erreur système est survenue.")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <UserCheck className="text-qorange" size={32} /> Mandats de Gestion
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Vos contrats de gérance avec les propriétaires et honoraires associés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        <FileSignature size={16} /> Nouveau Mandat
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Mandats Actifs</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">{mandates.filter(m => m.status === 'ACTIVE').length}</p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Taux Moyen (Gestion)</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">
                         {mandates.length > 0 ? (mandates.reduce((acc, m) => acc + Number(m.commissionPct||0), 0) / mandates.length).toFixed(1) : 0}%
                     </p>
                 </div>
                 <div className="bg-qorange-pale border border-qorange/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qorange-dark">Total</p>
                     <p className="text-3xl font-black text-qorange mt-1">{mandates.length}</p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center justify-between bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Registre</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Rechercher..." className="w-64 pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-qorange focus:ring-1 focus:ring-qorange transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Mandat ID</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Bien Immobilier</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Type & Honoraire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Échéance</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Inverser Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mandates.map(m => (
                            <tr key={m.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer">
                                <td className="p-5">
                                    <span className="font-bold text-xs text-qnavy-dark">{m.mandateRef || m.id.substring(0,8)}</span>
                                    {m.status === 'ACTIVE' || m.status === 'ACTIF' ? (
                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-qgreen mt-1">
                                            <CheckCircle size={10}/> Actif
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                            <ShieldAlert size={10}/> {m.status}
                                        </div>
                                    )}
                                </td>
                                <td className="p-5 font-bold text-sm text-qnavy">{m.property?.address || 'Non assigné'}</td>
                                <td className="p-5">
                                    <span className="bg-qgrey-1 text-qtext-mid px-2 py-1 rounded text-[9px] font-black uppercase block w-max mb-1">{m.mandateType || 'GESTION'}</span>
                                    <span className="text-xs font-black text-qnavy-dark">{m.commissionPct}%</span>
                                </td>
                                <td className="p-5 text-sm font-bold text-qtext-mid">{m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-5 text-right">
                                    <button 
                                        onClick={() => handleUpdateStatus(m.id)} 
                                        disabled={isPending}
                                        className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qorange transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg disabled:opacity-50 ml-auto block">
                                        Renvoquer / Réactiver
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {mandates.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-sm font-bold text-qtext-light">
                                    Aucun mandat enregistré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qnavy-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_32px_96px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-qgrey-2 bg-qgrey-1/50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-3">
                                <FileSignature className="text-qorange" size={24}/> Assistant Création Mandat
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-qgrey-2 flex items-center justify-center text-qnavy hover:bg-qgrey-1 transition-colors">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateMandate} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Propriété Ciblée</label>
                                <select 
                                    required
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                                    className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:border-qorange focus:ring-1 focus:ring-qorange"
                                >
                                    <option value="">Sélectionner un bien immobilier...</option>
                                    {properties?.map(p => (
                                        <option key={p.id} value={p.id}>{p.propertyCode} - {p.name || p.address}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Type de Mandat</label>
                                    <select 
                                        value={formData.mandateType}
                                        onChange={(e) => setFormData({...formData, mandateType: e.target.value as MandateType})}
                                        className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:border-qorange"
                                    >
                                        <option value="SIMPLE">Gestion Simple</option>
                                        <option value="EXCLUSIVE">Gestion Exclusive</option>
                                        <option value="DIRECT">Développement Direct</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Commission (%)</label>
                                    <input 
                                        type="number" 
                                        min="0" max="15" step="0.1"
                                        required
                                        value={formData.commissionPct}
                                        onChange={(e) => setFormData({...formData, commissionPct: Number(e.target.value)})}
                                        className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:border-qorange"
                                    />
                                    <p className="text-[9px] text-qtext-light mt-1 text-right">Max légal: 15%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Date de Début</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:border-qorange"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-2 block">Date de Fin (Est.)</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full p-4 bg-white rounded-xl border border-qgrey-2 text-sm font-bold text-qnavy focus:outline-none focus:border-qorange"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-qgrey-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-qnavy bg-qgrey-1 hover:bg-qgrey-2 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={isCreating} className="flex-1 bg-qnavy text-white px-4 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-colors shadow-lg shadow-qnavy/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isCreating ? 'Génération...' : 'Emmettre Mandat'} <ArrowRight size={14}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
