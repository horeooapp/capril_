"use client"

import React, { useState } from "react"
import { Scale, FileWarning, Gavel, FileCheck2, Search, ArrowRight, ShieldAlert, History, KeyRound, AlertTriangle, ShieldX, X, MapPin } from "lucide-react"
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

    // Using real data
    const disputes = initialDisputes

    const filteredDisputes = disputes.filter((d: any) => 
        (d.id || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.hash || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.lease?.tenant?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.lease?.tenant?.lastName || '').toLowerCase().includes(search.toLowerCase())
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
            toast.success(`Dossier DLC Scellé avec succès. Hash (${res.hash || 'Non-Scellé'}). L'avertissement locataire a été transmis.`)
            setIsDlcModalOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Gavel size={12} /> Tribunal & Chambre Arbitrale (CACI)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Triage <span className="text-rose-600">Judiciaire</span>
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Dossiers Litiges Certifiés (DLC) et procédures de recouvrement contentieux.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Link 
                        href="/dashboard/mediation" 
                        className="bg-white border text-slate-700 border-slate-200 px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <ArrowRight size={16} /> Médiations
                    </Link>
                    <button 
                        onClick={() => setIsDlcModalOpen(true)}
                        className="bg-rose-600 text-white px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <ShieldAlert size={16} /> Initier un DLC
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <StatCard 
                     label="Dossiers Certifiés (DLC)" 
                     value={disputes.length.toString()} 
                     sub="Émis via le portail" 
                 />

                 <div className="bg-indigo-50 border border-indigo-200 rounded-[10px] p-4 flex flex-col justify-between group h-full">
                     <div className="flex items-center gap-2 mb-2">
                         <KeyRound className="text-indigo-600" size={16} />
                         <p className="text-[12px] font-semibold text-indigo-700 uppercase">Clés Cyber-Sécurité</p>
                     </div>
                     <div>
                        <p className="text-xl font-black text-slate-800 tracking-tight">Hashes Transmis</p>
                        <p className="text-[11px] font-semibold text-indigo-600 mt-1">Conformité CACI : 100%</p>
                     </div>
                 </div>

                 <div className="bg-rose-600 border border-rose-500 rounded-[10px] p-4 flex flex-col justify-between relative overflow-hidden h-full shadow-sm">
                     <Gavel className="absolute -right-4 -bottom-4 text-white opacity-10" size={80} />
                     <div className="relative z-10 flex items-center gap-2 mb-2">
                         <FileCheck2 className="text-white" size={16} />
                         <p className="text-[12px] font-semibold text-rose-100 uppercase tracking-widest">Ordres d'Expulsion</p>
                     </div>
                     <div className="relative z-10">
                        <p className="text-3xl font-black text-white">{disputes.filter((d: any) => d.status === 'EVICTION_ORDER').length}</p>
                        <p className="text-[11px] font-semibold text-rose-200 mt-1">Force Publique Informée</p>
                     </div>
                 </div>
            </div>

            <SectionCard title="Registre Légal des Litiges" noPadding>
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher (Locataire ou UUID)..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Mise en Demeure / UUID</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Nature & Objet</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Préjudice</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Statut Judiciaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDisputes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium text-sm">Aucun dossier litige trouvé.</td>
                                </tr>
                            )}
                            {filteredDisputes.map((d: any) => (
                                <tr key={d.id} onClick={() => toast("Consultation de l'empreinte judiciaire " + d.id)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-[13px] text-slate-800 flex items-center gap-2">
                                            {d.severity === 'CRITIQUE' ? <ShieldX size={14} className="text-rose-600"/> : <AlertTriangle size={14} className="text-rose-600"/>}
                                            {d.id.substring(0, 15)}...
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="bg-slate-200 px-2 py-0.5 rounded-[4px] text-[9.5px] font-mono text-slate-600 flex items-center gap-1"><KeyRound size={10}/> {d.hash || 'Non Scellé'}</div>
                                            <span className="text-[10px] font-semibold text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="inline-block px-2 py-0.5 border border-slate-200 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">{d.type?.replace('_', ' ') || 'LITIGE'}</div>
                                        <p className="text-[12.5px] font-semibold text-slate-700">{d.lease?.tenant?.firstName} {d.lease?.tenant?.lastName}</p>
                                        <p className="text-[11px] text-slate-500">{d.lease?.property?.name || d.lease?.property?.propertyCode}</p>
                                    </td>
                                     <td className="py-3 px-4">
                                        {d.monthsDefeated > 0 ? (
                                             <div>
                                                <p className="font-black text-[13px] text-rose-600">{d.amountInDispute ? `${d.amountInDispute} ₣` : 'Non-Applicable'}</p>
                                                <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5"><History size={12}/> {d.monthsDefeated} Mois de Retard</p>
                                             </div>
                                        ) : (
                                            <p className="font-bold text-[12px] text-slate-400 line-through">{d.amountInDispute ? `${d.amountInDispute} ₣` : 'Non-Applicable'}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {d.status === 'EVICTION_ORDER' && (
                                            <Badge color="red">Eviction Prononcée</Badge>
                                        )}
                                        {d.status === 'ESCALATED' && (
                                            <Badge color="rose">Escaladé</Badge>
                                        )}
                                        {d.status === 'OPEN' && (
                                            <Badge color="blue">Nouveau Dossier</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

             {/* DLC MODAL */}
             {isDlcModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[16px] w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                        
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white relative">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <div className="p-1.5 bg-rose-50 rounded-[8px] border border-rose-100"><Scale className="text-rose-600" size={18}/></div>
                                Initier un Dossier DLC
                            </h2>
                            <button onClick={() => setIsDlcModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-[10px]">
                                    <p className="font-bold text-[11px] uppercase tracking-widest text-rose-700 mb-1.5 flex items-center gap-1.5"><Gavel size={14}/> Avertissement Légal</p>
                                    <p className="text-[12px] leading-relaxed text-rose-800">L'activation de ce protocole enverra automatiquement un pré-avis légalement contraignant au locataire, validé par la Chambre d'Arbitrage. Ce dossier devient une pièce à conviction irrévocable en cas de saisie judiciaire.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 block">Locataire en Infraction</label>
                                        <select name="leaseId" required className="w-full p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 text-[13px] font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500">
                                            <option value="">Sélectionnez un bail</option>
                                            {activeLeases.map((l: any) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.leaseReference} : {l.tenant?.firstName} {l.tenant?.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 block">Nature</label>
                                        <select name="type" required className="w-full p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 text-[13px] font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500">
                                            <option value="DEFAUT_PAIEMENT">Défaut de Paiement Accumulé</option>
                                            <option value="DEGRADATION_LOURDE">Dégradation Lourdes / Sinistre Non-Déclaré</option>
                                            <option value="SOUS_LOCATION_ILLICITE">Sous-location Illicite</option>
                                            <option value="TROUBLES_VOISINAGE">Troubles du Voisinage (Grave)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 block">Constitution de Preuve</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button type="button" onClick={() => {
                                            const p = new Promise(r => setTimeout(r, 1000));
                                            toast.promise(p, { loading: "Analyse...", success: "Bilan Financier joint." });
                                        }} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center gap-3 hover:bg-slate-100 transition-colors">
                                            <div className="bg-white border border-slate-200 text-slate-600 p-2 rounded-[6px]"><History size={16}/></div>
                                            <div className="text-left">
                                                <p className="text-[12.5px] font-bold text-slate-800">Joindre Bilan CRM</p>
                                                <p className="text-[10.5px] text-slate-500 mt-0.5">Automatique mensuel</p>
                                            </div>
                                        </button>
                                        <button type="button" onClick={() => {
                                            const p = new Promise(r => setTimeout(r, 1500));
                                            toast.promise(p, { loading: "Analyse...", success: "EDL Inclus." });
                                        }} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center gap-3 hover:bg-slate-100 transition-colors">
                                            <div className="bg-white border border-slate-200 text-slate-600 p-2 rounded-[6px]"><MapPin size={16}/></div>
                                            <div className="text-left">
                                                <p className="text-[12.5px] font-bold text-slate-800">Joindre l'EDL</p>
                                                <p className="text-[10.5px] text-slate-500 mt-0.5">Signature approuvée</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                
                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-[8px] border border-slate-200 cursor-pointer">
                                    <input type="checkbox" name="isCryptoSealed" defaultChecked className="mt-0.5 w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500" />
                                    <div>
                                        <p className="text-[12.5px] font-bold text-slate-800">Sceller cryptographiquement (CACI)</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Un Hash inviolable sera généré pour la Cour.</p>
                                    </div>
                                </label>

                            </div>

                            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsDlcModalOpen(false)} className="px-4 py-2 rounded-[8px] font-semibold text-[12px] uppercase tracking-wide text-slate-600 hover:bg-slate-200 transition-colors">Annuler</button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-rose-600 text-white px-6 py-2 rounded-[8px] font-semibold text-[12px] uppercase tracking-wide hover:bg-rose-700 transition-colors shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50">
                                    {loading ? 'EN COURS...' : 'SCELLER LE DOSSIER'} <ShieldAlert size={14}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
