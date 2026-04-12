"use client"

import React from "react"
import { Megaphone, RadioTower, Send, History, CheckCircle2 } from "lucide-react"
import { toast } from "sonner";

export default function CommunicationsDashboardPage() {
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
                <button onClick={() => toast.promise(new Promise(r=>setTimeout(r, 1000)), {loading:'Envoi en cours...', success:'Tous les destinataires ont reçu la notification.'})} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md flex items-center gap-2">
                    <Send size={16} /> Diffuser Alerte
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
                        <textarea className="w-full bg-white border border-qgrey-2 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" rows={3} placeholder="ATTENTION: Coupure d'eau générale prévue le..."></textarea>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-[10px] font-bold text-qtext-light uppercase">Cibler : Tous les locataires</span>
                            <button onClick={() => toast.success('Ouverture de l\'interface IA de conciliation...')} className="bg-qnavy text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-qnavy-dark transition-colors">Diffuser en Direct</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                             <History size={20}/>
                         </div>
                         <h3 className="text-xl font-black text-qnavy-dark">Historique Envois (SMS)</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 py-3 bg-qgrey-1/30 rounded-xl border border-qgrey-2">
                             <div>
                                 <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-black uppercase mr-2">Email</span>
                                 <span className="text-xs font-bold text-qnavy-dark">Campagne de Voeux 2026</span>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-qtext-light">
                                 <span>24 Jan 08:00</span>
                                 <CheckCircle2 size={14} className="text-qgreen" />
                             </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 py-3 bg-qgrey-1/30 rounded-xl border border-qgrey-2">
                             <div>
                                 <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase mr-2">SMS/Push</span>
                                 <span className="text-xs font-bold text-qnavy-dark">Rappel Révision Loyer</span>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-qtext-light">
                                 <span>12 Jan 10:30</span>
                                 <CheckCircle2 size={14} className="text-qgreen" />
                             </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 py-3 bg-qgrey-1/30 rounded-xl border border-qgrey-2">
                             <div>
                                 <span className="bg-qorange-pale text-qorange px-2 py-0.5 rounded text-[9px] font-black uppercase mr-2">Ticker</span>
                                 <span className="text-xs font-bold text-qnavy-dark">Fumigation Immeuble B</span>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-qtext-light">
                                 <span>10 Jan 09:00</span>
                                 <CheckCircle2 size={14} className="text-qgreen" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
