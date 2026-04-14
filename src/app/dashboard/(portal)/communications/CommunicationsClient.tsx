"use client"

import React, { useState, useTransition } from "react"
import { Megaphone, RadioTower, Send, History, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createNews } from "@/actions/news-actions"
import { adminBroadcast as sendGlobalAlert } from "@/actions/notification-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

interface CommunicationsClientProps {
    initialNews: any[]
}

export default function CommunicationsClient({ initialNews }: CommunicationsClientProps) {
    const [message, setMessage] = useState("")
    const [isPending, startTransition] = useTransition()
    const [newsHistory, setNewsHistory] = useState(initialNews)

    const handleBroadcastTicker = () => {
        if (!message.trim()) {
            toast.error("Veuillez saisir un message pour l'annonce.")
            return
        }

        startTransition(async () => {
            const res = await createNews(message)
            if (res.success) {
                toast.success("News Ticker mis à jour et diffusé en direct !")
                setMessage("")
                // Refresh local history view (optimistic-ish)
                setNewsHistory([res.data, ...newsHistory])
            } else {
                toast.error(res.error || "Erreur lors de la diffusion.")
            }
        })
    }

    const handleBroadcastAlert = () => {
        if (!message.trim()) {
            toast.error("Veuillez saisir un message pour l'alerte.")
            return
        }

        startTransition(async () => {
            try {
                const res = await sendGlobalAlert(message, "🔔 Alerte QAPRIL")
                if (res.success) {
                    toast.success(`Alerte diffusée avec succès à ${res.sentTo} locataires.`)
                } else {
                    toast.error("Erreur lors de l'envoi de l'alerte.")
                }
            } catch (err: any) {
                toast.error(err.message || "Erreur critique d'envoi.")
            }
        })
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Megaphone className="text-amber-500" size={32} /> Communications
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Le centre de tir SMS et d'alertes instantanées Push (News Ticker).
                    </p>
                </div>
                <button 
                    onClick={handleBroadcastAlert}
                    disabled={isPending}
                    className="bg-amber-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Diffuser Alerte SMS/Push
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard>
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                             <RadioTower size={20}/>
                         </div>
                         <h3 className="text-xl font-black text-slate-900">Le News Ticker</h3>
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                        Publiez un message urgent qui défilera en continu sur les tableaux de bord de tous vos locataires ou propriétaires (Coupure d'eau, Assemblée reportée).
                    </p>
                    
                    <div className="bg-slate-50 rounded-[12px] p-4 border border-slate-200/60 mb-6">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Message de l'annonce</label>
                        <textarea 
                            className="w-full bg-white border border-slate-200 rounded-[8px] p-3 text-[13px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm transition-all" 
                            rows={3} 
                            placeholder="ATTENTION: Coupure d'eau générale prévue le..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <div className="flex justify-between items-center mt-3 pt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cibler : Tous les locataires</span>
                            <button 
                                onClick={handleBroadcastTicker}
                                disabled={isPending}
                                className="bg-slate-800 text-white px-4 py-2.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {isPending && <Loader2 size={12} className="animate-spin" />}
                                Diffuser sur le Bandeau
                            </button>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard>
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-[10px] bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
                             <History size={20}/>
                         </div>
                         <h3 className="text-xl font-black text-slate-900">Historique des annonces</h3>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {newsHistory.length === 0 ? (
                            <p className="text-[12px] text-slate-400 italic text-center py-8">Aucun historique de diffusion.</p>
                        ) : (
                            newsHistory.map((item: any) => (
                                <div key={item.id} className="flex flex-col gap-2 px-4 py-3 bg-slate-50 rounded-[10px] border border-slate-200/60 shadow-sm transition-hover hover:border-slate-300">
                                    <div className="flex justify-between items-start">
                                        {item.isActive ? <Badge color="emerald">Actif</Badge> : <Badge color="gray">Ancien</Badge>}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
                                            {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-800 leading-relaxed">
                                        {item.content}
                                    </p>
                                    <div className="flex justify-end pt-1">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>
        </div>
    )
}
