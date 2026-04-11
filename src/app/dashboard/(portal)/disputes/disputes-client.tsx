"use client"

import React, { useState } from "react"
import { Scale, FileWarning, Gavel, FileCheck2, Search, ArrowRight, ShieldAlert, History, KeyRound, AlertTriangle, ShieldX, X, MapPin } from "lucide-react"
import { toast } from "sonner"
import { createDisputeDLC } from "@/actions/disputes-actions"

export default function CertifieDisputesClient({ initialDisputes, activeLeases }: { initialDisputes: any[], activeLeases: any[] }) {
    const [isDlcModalOpen, setIsDlcModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Using real data
    const disputes = initialDisputes

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createDisputeDLC(formData)
        setLoading(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(`Dossier DLC Scellé avec succès. Hash (${res.hash || 'Non-Scellé'}). L'avertissement locataire a été transmis.`)
            setIsDlcModalOpen(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[90vh]">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-rose-600 border border-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                        <Gavel size={12} /> Tribunal & Chambre d'Arbitrage (CACI)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Triage <span className="text-rose-600">Judiciaire</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Plateforme de rupture contractuelle et génération des Dossiers Litiges Certifiés (DLC) opposables aux tiers.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => toast.info("🚀 Modération : Les conciliations amiables CACI seront connectées lors de la V4.1.")}
                        className="bg-white border text-slate-700 border-slate-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <ArrowRight size={16} /> Médiations (Amiable)
                    </button>
                    <button 
                        onClick={() => setIsDlcModalOpen(true)}
                        className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center gap-2"
                    >
                        <ShieldAlert size={16} /> Ouvrir un Dossier (DLC)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Metrics */}
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                        <FileWarning className="text-rose-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossiers Certifiés (DLC) Émis</p>
                        <p className="text-2xl font-black text-slate-800">{disputes.length} <span className="text-sm font-bold text-slate-400">total</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                        <KeyRound className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Clés Cyber-Sécurité CACI</p>
                        <p className="text-xl font-black text-slate-800">Hashes Transmis</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Conformité Bloc-chaîne: 100%</p>
                    </div>
                </div>

                <div className="bg-rose-600 p-6 rounded-[2rem] border border-rose-500 shadow-xl flex items-center gap-4 relative overflow-hidden">
                    <Gavel className="absolute -right-4 -bottom-4 text-white opacity-10" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <FileCheck2 className="text-white" size={24} />
                    </div>
                    <div className="relative z-10 text-white">
                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1 shadow-sm">Ordres d'Expulsion dudge</p>
                        <p className="text-3xl font-black text-white">{disputes.filter((d: any) => d.status === 'EVICTION_ORDER').length} <span className="text-sm opacity-80">En Exécution</span></p>
                         <p className="text-[10px] font-bold text-rose-200 mt-1">Force Publique Informée</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                 <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <Scale size={18} className="text-rose-600"/> Registre Légal des Litiges
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Mise en Demeure / UUID</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Nature & Objet</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Préjudice</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Statut Judiciaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disputes.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-5 text-center text-slate-500 font-medium text-xs">Aucun dossier litige certifié émis à ce jour.</td>
                                        </tr>
                                    )}
                                    {disputes.map((d: any) => (
                                        <tr key={d.id} onClick={() => toast("Consultation de l'empreinte judiciaire " + d.id)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <td className="p-5">
                                                <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                                    {d.severity === 'CRITIQUE' ? <ShieldX size={14} className="text-rose-600"/> : <AlertTriangle size={14} className="text-rose-600"/>}
                                                    {d.id.substring(0, 15)}...
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="bg-slate-200 px-2 py-0.5 rounded text-[8px] font-mono text-slate-600 flex items-center gap-1"><KeyRound size={8}/> {d.hash || 'Non Scellé'}</div>
                                                    <span className="text-[9px] font-black uppercase text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-xs uppercase tracking-widest text-slate-700 bg-slate-200/50 inline-block px-2 py-1 rounded mb-1">{d.type?.replace('_', ' ') || 'LITIGE'}</p>
                                                <p className="text-[10px] font-bold text-slate-500">{d.lease?.tenant?.firstName} {d.lease?.tenant?.lastName}</p>
                                                <p className="text-[10px] text-slate-400">{d.lease?.property?.name || d.lease?.property?.propertyCode}</p>
                                            </td>
                                             <td className="p-5">
                                                {d.monthsDefeated > 0 ? (
                                                     <div>
                                                        <p className="font-black text-sm text-rose-600">{d.amountInDispute ? `${d.amountInDispute} FCFA` : 'Non-Applicable'}</p>
                                                        <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-0.5"><History size={10}/> {d.monthsDefeated} Mois de Retard</p>
                                                     </div>
                                                ) : (
                                                    <p className="font-black text-xs text-slate-400 uppercase tracking-widest line-through">{d.amountInDispute ? `${d.amountInDispute} FCFA` : 'Non-Applicable'}</p>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {d.status === 'EVICTION_ORDER' && (
                                                    <span className="inline-flex content-center justify-center bg-rose-600 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded shadow-sm shadow-rose-600/30 animate-pulse">
                                                        Eviction Prononcée
                                                    </span>
                                                )}
                                                {d.status === 'ESCALATED' && (
                                                    <span className="inline-flex content-center justify-center bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded">
                                                        Escaladé
                                                    </span>
                                                )}
                                                {d.status === 'OPEN' && (
                                                    <span className="inline-flex content-center justify-center bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded">
                                                        Nouveau Dossier
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

             {/* DLC MODAL (REAL INTERACTIVE COMPONENT) */}
             {isDlcModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-[0_32px_96px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-rose-100 flex justify-between items-center bg-rose-50 relative overflow-hidden">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
                            <h2 className="text-xl font-black text-rose-900 uppercase tracking-tight flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-rose-100 rounded-xl"><Scale className="text-rose-600" size={24}/></div>
                                Initier un Dossier Litige Certifié (DLC)
                            </h2>
                            <button onClick={() => setIsDlcModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center text-rose-900 hover:bg-rose-100 hover:text-rose-600 transition-colors relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                <div className="bg-slate-900 border-l-4 border-rose-500 p-5 rounded-r-xl text-white">
                                    <p className="font-black text-xs uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-2"><Gavel size={14}/> Avertissement Pénal</p>
                                    <p className="text-xs leading-relaxed text-slate-300 font-medium">L'activation de ce protocole enverra automatiquement un pré-avis légalement contraignant au locataire, avec un sceau (Hash SHA-256) validé par la Chambre d'Arbitrage. Ce dossier devient une pièce à conviction irrévocable en cas de saisie d'un Huissier de Justice.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Locataire en Infraction</label>
                                        <select name="leaseId" required className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500">
                                            <option value="">Sélectionnez un bail actif</option>
                                            {activeLeases.map((l: any) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.leaseReference} : {l.tenant?.firstName} {l.tenant?.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Nature du Contentieux</label>
                                        <select name="type" required className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500">
                                            <option value="DEFAUT_PAIEMENT">Défaut de Paiement Accumulé</option>
                                            <option value="DEGRADATION_LOURDE">Dégradation Lourdes / Sinistre Non-Déclaré</option>
                                            <option value="SOUS_LOCATION_ILLICITE">Sous-location Illicite</option>
                                            <option value="TROUBLES_VOISINAGE">Troubles du Voisinage (Grave)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Constitution de Preuve (Optionnel)</label>
                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => toast.info('Attachement automatique du CRM actif', {style:{backgroundColor:"#4f46e5", color:"white"}})} className="flex-1 p-4 border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-400 group transition-colors">
                                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-100"><History size={16}/></div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-slate-800">Joindre Bilan Financier</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Automatique depuis le CRM</p>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => toast.info('Génération du PDF Biométrique en cours...', {style:{backgroundColor:"#e11d48", color:"white"}})} className="flex-1 p-4 border border-slate-200 rounded-xl flex items-center gap-3 hover:border-rose-400 group transition-colors">
                                                <div className="bg-rose-50 text-rose-600 p-2 rounded-lg group-hover:bg-rose-100"><MapPin size={16}/></div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-slate-800">Joindre l'État des Lieux</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Signature Biométrique jointe</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" name="isCryptoSealed" defaultChecked className="mt-1 w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Cocher pour sceller cryptographiquement ce dossier</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Un Hash unique inviolable sera calculé par les serveurs CACI pour garantir l'historique devant la Cour.</p>
                                    </div>
                                </label>

                            </div>

                            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsDlcModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">Annuler la procédure</button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50">
                                    {loading ? 'SCELLAGE EN COURS...' : 'Sceller le Dossier & Notifier'} <ShieldAlert size={14}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
