"use client"

import React, { useState, useTransition } from "react"
import { Megaphone, RadioTower, Send, History, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createNews } from "@/actions/news-actions"
import { adminBroadcast as sendGlobalAlert } from "@/actions/notification-actions"

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Megaphone className="text-orange-500" size={32} /> Communications
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le centre de tir SMS et d'alertes instantanées Push (News Ticker).
                    </p>
                </div>
                <button 
                    onClick={handleBroadcastAlert}
                    disabled={isPending}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Diffuser Alerte SMS/Push
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                             <RadioTower size={20}/>
                         </div>
                         <h3 className="text-xl font-black text-qnavy-dark">Le News Ticker</h3>
                    </div>
                    <p className="text-sm text-qtext-mid font-medium leading-relaxed mb-6">
                        Publiez un message urgent qui défilera en continu sur les tableaux de bord de tous vos locataires ou propriétaires (Coupure d'eau, Assemblée reportée).
                    </p>
                    
                    <div className="bg-qgrey-1/50 rounded-xl p-4 border border-qgrey-2 mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light block mb-2">Message de l'annonce</label>
                        <textarea 
                            className="w-full bg-white border border-qgrey-2 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                            rows={3} 
                            placeholder="ATTENTION: Coupure d'eau générale prévue le..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-[10px] font-bold text-qtext-light uppercase">Cibler : Tous les locataires</span>
                            <button 
                                onClick={handleBroadcastTicker}
                                disabled={isPending}
                                className="bg-qnavy text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-qnavy-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isPending && <Loader2 size={12} className="animate-spin" />}
                                Diffuser sur le Bandeau
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                             <History size={20}/>
                         </div>
                         <h3 className="text-xl font-black text-qnavy-dark">Historique des annonces</h3>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {newsHistory.length === 0 ? (
                            <p className="text-xs text-qtext-light italic text-center py-8">Aucun historique de diffusion.</p>
                        ) : (
                            newsHistory.map((item: any) => (
                                <div key={item.id} className="flex flex-col gap-2 px-4 py-3 bg-qgrey-1/30 rounded-xl border border-qgrey-2">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.isActive ? 'bg-qgreen-pale text-qgreen' : 'bg-qgrey-2 text-qgrey-4'}`}>
                                            {item.isActive ? 'Actif' : 'Ancien'}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-qtext-light italic">
                                            {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-qnavy-dark leading-relaxed">
                                        {item.content}
                                    </p>
                                    <div className="flex justify-end pt-1">
                                        <CheckCircle2 size={14} className="text-qgreen" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
