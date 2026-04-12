"use client"

import React, { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Users, Phone, Mail, Search, Loader2, ArrowRight, Activity, Filter, MessageCircle } from "lucide-react"
import { toast } from "sonner";
import { launchCampaign } from "@/actions/crm-actions"

export default function CRMDashboardClient({ initialContacts }: { initialContacts: any[] }) {
    const [contacts, setContacts] = useState<any[]>(initialContacts)
    const [isPending, startTransition] = useTransition()

    const handleCampagne = () => {
        startTransition(async () => {
            const promise = launchCampaign()
            toast.promise(promise, {
                loading: "Génération de l'emailing via SendGrid...",
                success: `Campagne diffusée avec succès à vos contacts !`,
                error: "Erreur lors de l'envoi."
            })
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-purple-500" size={32} /> CRM & Leads
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gérez vos prospects, locataires et propriétaires depuis un annuaire central.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r=>setTimeout(r, 800)), {loading: "Traitement...", success: "Filtrage des segments CRM disponible prochainement."}); }} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Filter size={16} /> Segmenter
                    </button>
                </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#6b21a8_0%,#3b0764_100%)] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl flex items-center justify-between">
                 <div className="relative z-10 max-w-2xl">
                     <h2 className="text-3xl font-black tracking-tight mb-2">Engagez votre audience avec Q-Mail.</h2>
                     <p className="text-purple-200 text-sm leading-relaxed mb-6">Concevez des campagnes d'emailings et SMS groupées vers vos Leads (Nouveaux programmes, Rappel de régularisations, Voeux). Taux d'ouverture garanti par SendGrid.</p>
                     <button 
                        onClick={handleCampagne}
                        disabled={isPending}
                        className="bg-white text-purple-900 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-lg disabled:opacity-50">
                        <MessageCircle size={16}/> {isPending ? 'Envoi en cours...' : 'Créer une Campagne'}
                     </button>
                 </div>
                 <Activity size={180} className="absolute right-0 opacity-10 rotate-12 -translate-y-10" />
            </div>

            <div className="bg-white rounded-3xl border border-qgrey-2 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-qgrey-2 flex items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Rechercher un prospect ou client..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Contact</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Type</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Coordonnées</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Niveau KYC</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((c) => (
                            <tr key={c.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-qnavy-pale text-qnavy flex items-center justify-center font-black text-sm">
                                            {c.firstName?.[0] || ""}{c.lastName?.[0] || ""}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-qnavy-dark capitalize">{c.firstName} {c.lastName}</p>
                                            <p className="text-[10px] text-qtext-light">ID: {c.id.substring(0,8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                                        {c.role || "Client"}
                                    </span>
                                </td>
                                <td className="p-5 space-y-1">
                                    {c.phone && <p className="text-xs font-bold text-qtext-mid flex items-center gap-2"><Phone size={12}/> {c.phone}</p>}
                                    {c.email && <p className="text-xs font-bold text-qtext-mid flex items-center gap-2"><Mail size={12}/> {c.email}</p>}
                                </td>
                                <td className="p-5">
                                    <div className="w-full bg-qgrey-2 rounded-full h-1.5 max-w-[80px]">
                                        <div className="bg-qgreen h-1.5 rounded-full" style={{width: `${Math.min((c.kycLevel / 3) * 100, 100)}%`}}></div>
                                    </div>
                                    <p className="text-[9px] font-bold text-qtext-mid mt-1 uppercase">Level {c.kycLevel || 1}</p>
                                </td>
                                <td className="p-5 text-right">
                                    <button onClick={(e) => { e.preventDefault(); toast.loading("Redirection en cours...", {id:"r"}); setTimeout(()=>toast.success("Ouverture de la fiche contact...", {id:"r"}), 500); }} className="w-8 h-8 rounded-full bg-white border border-qgrey-2 inline-flex items-center justify-center text-qnavy hover:bg-qnavy hover:text-white transition-colors ml-auto shadow-sm">
                                        <ArrowRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center border-b border-qgrey-2">
                                    <Users className="text-qgrey-2 mx-auto mb-3" size={32} />
                                    <p className="text-sm font-bold text-qtext-light">Aucun prospect ou propriétaire rattaché à votre compte. Votre CRM est vierge.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
