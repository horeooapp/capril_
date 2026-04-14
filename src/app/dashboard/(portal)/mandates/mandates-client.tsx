"use client"

import React, { useState, useTransition } from "react"
import { ClipboardList, Search, FileSignature, CheckCircle, ShieldAlert, ArrowRight, UserCheck } from "lucide-react"
import { toast } from "sonner";
import { updateMandateStatus, createMandate, CreateMandateInput } from "@/actions/mandate-actions";
import { MandateType } from "@prisma/client";
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

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
                agentId: "self", 
                mandateType: formData.mandateType as MandateType,
                commissionPct: Number(formData.commissionPct),
                startDate: formData.startDate as string,
                endDate: formData.endDate as string
            } as any)

            if (res.success) {
                toast.success("Mandat Brouillon créé. En attente de signature du propriétaire.")
                setIsModalOpen(false)
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
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <UserCheck className="text-amber-500" size={32} /> Mandats de Gestion
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Vos contrats de gérance avec les propriétaires et honoraires associés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2">
                        <FileSignature size={16} /> Nouveau Mandat
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <StatCard 
                    title="Mandats Actifs"
                    value={`${mandates.filter(m => m.status === 'ACTIVE').length}`}
                 />
                 <StatCard 
                    title="Taux Moyen (Gestion)"
                    value={`${mandates.length > 0 ? (mandates.reduce((acc, m) => acc + Number(m.commissionPct||0), 0) / mandates.length).toFixed(1) : 0}%`}
                 />
                 <StatCard 
                    title="Total Mandats"
                    value={`${mandates.length}`}
                 />
            </div>

            <SectionCard title="Registre" icon={<ClipboardList className="text-slate-500" />}>
                <div className="mb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[13px] font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-slate-800" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="pb-3 font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-2">Mandat ID</th>
                                <th className="pb-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Bien Immobilier</th>
                                <th className="pb-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Type & Honoraire</th>
                                <th className="pb-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Échéance</th>
                                <th className="pb-3 font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right pr-2">Inverser Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mandates.map(m => (
                                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <td className="py-4 pl-2">
                                        <span className="font-bold text-[13px] text-slate-900">{m.mandateRef || m.id.substring(0,8)}</span>
                                        <div className="mt-1">
                                            {(m.status === 'ACTIVE' || m.status === 'ACTIF') ? (
                                                <Badge variant="success" className="inline-flex items-center gap-1"><CheckCircle size={10}/> Actif</Badge>
                                            ) : (
                                                <Badge variant="error" className="inline-flex items-center gap-1"><ShieldAlert size={10}/> {m.status}</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-[14px] text-slate-800">{m.property?.address || 'Non assigné'}</td>
                                    <td className="py-4">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase block w-max mb-1.5 border border-slate-200 shadow-sm">{m.mandateType || 'GESTION'}</span>
                                        <span className="text-[14px] font-black text-slate-900">{m.commissionPct}%</span>
                                    </td>
                                    <td className="py-4 text-[13px] font-bold text-slate-500">{m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="py-4 text-right pr-2">
                                        <button 
                                            onClick={() => handleUpdateStatus(m.id)} 
                                            disabled={isPending}
                                            className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-amber-600 transition-colors border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 px-3 py-2 rounded-[8px] disabled:opacity-50 ml-auto block shadow-sm">
                                            Révocation / Rétabli
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {mandates.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-[13px] font-bold text-slate-500 bg-slate-50 rounded-[12px] border border-dashed border-slate-200">
                                        Aucun mandat enregistré.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <FileSignature className="text-amber-500" size={24}/> Créer Mandat
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateMandate} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Propriété Ciblée</label>
                                <select 
                                    required
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                                    className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                >
                                    <option value="">Sélectionner un bien immobilier...</option>
                                    {properties?.map(p => (
                                        <option key={p.id} value={p.id}>{p.propertyCode} - {p.name || p.address}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Type de Mandat</label>
                                    <select 
                                        value={formData.mandateType}
                                        onChange={(e) => setFormData({...formData, mandateType: e.target.value as MandateType})}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                    >
                                        <option value="SIMPLE">Gestion Simple</option>
                                        <option value="EXCLUSIVE">Gestion Exclusive</option>
                                        <option value="DIRECT">Développement Direct</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Commission (%)</label>
                                    <input 
                                        type="number" 
                                        min="0" max="15" step="0.1"
                                        required
                                        value={formData.commissionPct}
                                        onChange={(e) => setFormData({...formData, commissionPct: Number(e.target.value)})}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 text-right">Max légal: 15%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Date de Début</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Date de Fin</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-[10px] border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={isCreating} className="flex-1 bg-slate-900 text-white py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
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
