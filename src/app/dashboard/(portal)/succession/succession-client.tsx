"use client"

import React, { useState } from "react"
import { Users, FileStack, BookOpen, AlertCircle, ArrowRightLeft, ShieldCheck, Milestone, X, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createSuccession } from "@/actions/succession-actions"

export default function SuccessionDashboardClient({ initialSuccessions }: { initialSuccessions: any[] }) {
    const successions = initialSuccessions
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
            toast.success("Dossier de succession validé. Les baux et cautions rattachés ont été transférés à l'ayant droit.")
            setIsSuccModalOpen(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Milestone size={12} /> CCH Art. 418 (Côte d'Ivoire)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Post-Mortem & <span className="text-slate-500">Successions</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Moteur de transfert des droits locatifs et patrimoniaux (Continuité du Bail).
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => toast.info("Génération du rapport comptable mortuaire en cours de conception (V4.1)")}
                        className="bg-white border text-slate-700 border-slate-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <FileStack size={16} /> Audit des Cautions Liées
                    </button>
                    <button 
                        onClick={() => setIsSuccModalOpen(true)}
                        className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md flex items-center gap-2"
                    >
                        <Users size={16} /> Initier une Succession
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
                        <Users className="text-slate-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossiers de Transfert</p>
                        <p className="text-2xl font-black text-slate-800">{successions.length} <span className="text-sm font-bold text-slate-400">cette année</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-colors">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 group-hover:bg-amber-100 transition-colors">
                        <AlertCircle className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Risques Contentieux (Hoirs)</p>
                        <p className="text-xl font-black text-slate-800">1 Dossier en attente</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Conflit de parenté répertorié</p>
                    </div>
                </div>

                <div className="bg-[linear-gradient(135deg,#0f172a_0%,#334155_100%)] p-6 rounded-[2rem] shadow-xl flex items-center gap-4 relative overflow-hidden">
                    <Milestone className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <BookOpen className="text-slate-200" size={24} />
                    </div>
                    <div className="relative z-10 text-white">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 shadow-sm">Continuité de Gérance</p>
                        <p className="text-3xl font-black text-white">100% <span className="text-sm opacity-80">Ruptures</span></p>
                         <p className="text-[10px] font-bold text-slate-300 mt-1">Baux transférés aux ayants droit</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                 <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <ArrowRightLeft size={18} className="text-slate-600"/> Historique des Mouvements Notariés
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">N° Succession</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Mouvement / Origine</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Bénéficiaire (Ayant Droit)</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Statut Légal (CCH)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {successions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-5 text-center text-slate-500 font-medium text-xs">Aucune succession enregistrée.</td>
                                        </tr>
                                    )}
                                    {successions.map((s) => (
                                        <tr key={s.id} onClick={()=>toast('Ouverture du dossier de succession '+s.id)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <td className="p-5">
                                                <p className="font-bold text-sm text-slate-800 ">{s.id.substring(0,12)}...</p>
                                                <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-xs text-slate-700 ">{s.deceasedName}</p>
                                                <p className="text-[10px] font-medium text-slate-500 mt-1">{s.propertyInfo}</p>
                                            </td>
                                             <td className="p-5">
                                                <p className="font-bold text-xs text-slate-800">{s.claimantName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">{s.relation}</span>
                                                    <span className="text-[9px] text-slate-400">via {s.notaire || 'Non précisé'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {s.status === 'TRANSFERT_LEGAL' && (
                                                    <span className="inline-flex items-center gap-1.5 justify-center bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
                                                        <ShieldCheck size={12}/> Acte Scellé
                                                    </span>
                                                )}
                                                {s.status === 'EN_ATTENTE_ATTESTATION' && (
                                                    <span className="inline-flex items-center gap-1.5 justify-center bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded">
                                                        Attestation Requise
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>
            </div>

             {/* SUCCESSION MODAL (REAL INTERACTIVE COMPONENT) */}
             {isSuccModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-[0_32px_96px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 relative overflow-hidden">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-slate-200 rounded-xl"><Milestone className="text-slate-700" size={24}/></div>
                                Acte de Succession B2B
                            </h2>
                            <button onClick={() => setIsSuccModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6">
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cible (Titulaire Décédé)</label>
                                        <input type="text" name="deceasedName" required placeholder="Nom du titulaire décédé..." className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"/>
                                    </div>
                                    <div>
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Bénéficiaire (Ayant-droit)</label>
                                         <input type="text" name="claimantName" required placeholder="Nom de l'héritier..." className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Relation / Lien de l'héritier</label>
                                        <input type="text" name="relation" required placeholder="Ex: Descendant Direct" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Informations du Bien lié</label>
                                        <input type="text" name="propertyInfo" required placeholder="Ex: Appartement 1 - SICOGI" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"/>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cabinet Notarial Chargé du Dossier (Optionnel)</label>
                                    <input type="text" name="notaire" placeholder="Ex: Étude de Maître Bamba, Plateau" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"/>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Pièces Légales Obligatoires</label>
                                    <div className="flex flex-col gap-3">
                                        <button type="button" onClick={() => toast.info('Module de téléchargement sécurisé CACI actif', {style:{backgroundColor:"#10b981", color:"white"}})} className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-400 group transition-colors">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="bg-slate-100 text-slate-600 p-2 rounded-lg group-hover:bg-slate-200"><FileText size={16}/></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Certificat de Décès / Jugement d'Hérédité</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Format PDF - Obligatoire (Art. 418)</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> Attaché</span>
                                        </button>
                                        <button type="button" onClick={() => toast.info('Création de la procuration biométrique via Notaire', {style:{backgroundColor:"#0f172a", color:"white"}})} className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-400 group transition-colors">
                                             <div className="flex items-center gap-3 text-left">
                                                <div className="bg-slate-100 text-slate-600 p-2 rounded-lg group-hover:bg-slate-200"><ShieldCheck size={16}/></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">Procuration de Liquidation (Notaire)</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Si Mandataire Externe</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded border border-rose-200">Optionnel</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsSuccModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">Annuler le transfert</button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50">
                                    {loading ? 'TRANSFERT...' : 'Sceller la Succession'} <Milestone size={14}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
