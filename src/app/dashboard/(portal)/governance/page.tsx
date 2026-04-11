"use client"

import React from "react"
import { Users, Presentation, CheckSquare, Calendar, Globe } from "lucide-react"

export default function GovernanceDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Presentation className="text-qblue" size={32} /> Gouvernance & AG
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Plateforme de rassemblement pour les Syndicats de Copropriétaires.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm p-8">
                <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-lg overflow-hidden flex flex-col items-center text-center">
                    <Globe size={80} className="text-blue-500/20 absolute -top-10 -right-10" />
                    <Calendar size={48} className="text-blue-400 mb-6" />
                    <h2 className="text-2xl font-black mb-4">Assemblée Générale Annuelle</h2>
                    <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-2xl mb-8">
                        Organisez vos AG Virtuellement. Convoquez les copropriétaires par email tracé, proposez des résolutions et menez des votes électroniques via QAPRIL avec génération immédiate de PV.
                    </p>
                    <button className="bg-white text-qnavy px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-white/10">
                        Convoquer Nouvelle AG
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                     <div className="bg-qgrey-1/30 border border-qgrey-2 rounded-2xl p-6">
                         <div className="flex items-center justify-between mb-4">
                             <h4 className="font-black text-qnavy">Votes en Cours</h4>
                             <span className="bg-qorange-pale text-qorange px-2 py-0.5 rounded text-[10px] font-black uppercase">Résolution #42</span>
                         </div>
                         <p className="text-xs font-bold text-qtext-mid mb-4">Refection de la toiture Bâtiment A.</p>
                         <div className="w-full bg-qgrey-2 rounded-full h-2 mb-2">
                             <div className="bg-qgreen h-2 rounded-full" style={{width: '65%'}}></div>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">65% Pour / Quorum Actif</p>
                     </div>
                </div>
            </div>
        </div>
    )
}
