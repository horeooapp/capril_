"use client"

import React from "react"
import { SmartphoneNfc, Zap, Camera, Key, CheckCircle, Database, Plus } from "lucide-react"

export default function BDQDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <SmartphoneNfc className="text-pink-500" size={32} /> Baux Déclaratifs
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Intégrez des locataires existants sans repasser par tout le workflow commercial.
                    </p>
                </div>
                <button className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Initialiser BDQ (Fast)
                </button>
            </div>

            <div className="bg-[linear-gradient(135deg,#db2777_0%,#9d174d_100%)] rounded-[2.5rem] p-8 md:p-14 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-white/20">
                        <Zap size={12} className="text-yellow-300"/> Onboarding PropTech
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">Digitalisez vos anciens baux en 2 min chrono.</h2>
                    <p className="text-pink-100 text-sm md:text-base font-medium leading-relaxed mb-8">
                        L'algorithme IA `bdq-ai` extrait les données d'un document PDF scanné pour recréer virtuellement le contrat Actif sur QAPRIL. Plus besoin de retaper manuellement les clauses pour générer des quittances électroniques !
                    </p>
                    <div className="flex gap-4">
                       <button className="bg-white text-pink-700 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                           <Camera size={18} /> Scanner un Contrat
                       </button>
                    </div>
                </div>
                
                <div className="relative z-10 w-full md:w-auto flex-1 max-w-[320px]">
                     <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
                         <h4 className="text-xs font-black uppercase tracking-widest text-pink-200 mb-6 flex items-center gap-2">
                             <Database size={14}/> Statistiques Import
                         </h4>
                         <div className="space-y-4">
                             <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center">
                                 <span className="text-sm font-bold text-pink-100">BDQ Actifs</span>
                                 <span className="text-2xl font-black text-white">124</span>
                             </div>
                             <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center">
                                 <span className="text-sm font-bold text-pink-100">En cours d'Analyse IA</span>
                                 <span className="text-2xl font-black text-white">3</span>
                             </div>
                         </div>
                     </div>
                </div>
                <SmartphoneNfc size={300} className="absolute left-[50%] top-1/2 -translate-y-1/2 opacity-5 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm text-center">
                    <Key size={32} className="text-qgrey-2 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-qnavy-dark mb-2">Pas de KYC Bloquant</h3>
                    <p className="text-xs font-medium text-qtext-mid">Idéal pour les locataires historiques dont vous assurez déjà la fiabilité manuellement.</p>
                </div>
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm text-center">
                    <Zap size={32} className="text-qorange mx-auto mb-4" />
                    <h3 className="text-lg font-black text-qnavy-dark mb-2">Activation du Wallet</h3>
                    <p className="text-xs font-medium text-qtext-mid">Dès l'importation, le locataire se voit ouvrir son wallet numérique pour régler par WebPay.</p>
                </div>
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm text-center">
                    <CheckCircle size={32} className="text-qgreen mx-auto mb-4" />
                    <h3 className="text-lg font-black text-qnavy-dark mb-2">Preuve Légal Conservée</h3>
                    <p className="text-xs font-medium text-qtext-mid">Le scan papier initial est rattaché au C-Vault du lease électronique pour prouver sa genèse.</p>
                </div>
            </div>
        </div>
    )
}
