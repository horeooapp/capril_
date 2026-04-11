"use client"

import React, { useState } from "react"
import { Bot, Zap, Mail, MessageSquare, Clock, Settings2, Play, Pause, AlertTriangle } from "lucide-react"

export default function AutomationsDashboardPage() {
    const [toggles, setToggles] = useState({
        relance: true,
        quittance: true,
        anniversaire: false,
        assurance: true
    })

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Bot className="text-blue-500" size={32} /> Automatisations
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Configurez les robots RPA de relance et l'envoi d'emails transactionnels.
                    </p>
                </div>
                <div className="flex bg-qgrey-1 rounded-xl p-1 border border-qgrey-2 shadow-inner">
                     <button className="px-6 py-2 bg-white text-qnavy font-black text-xs uppercase tracking-widest rounded-lg shadow-sm">Workflows</button>
                     <button className="px-6 py-2 text-qtext-light font-black text-xs uppercase tracking-widest hover:text-qnavy">Logs Cron</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workflow Card 1 */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-blue-400 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                 <MessageSquare size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-qnavy-dark">Relances Impayés (J+5)</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-qtext-light mt-1 flex items-center gap-1"><Clock size={10}/> Tous les 5 du mois à 08:00</p>
                             </div>
                         </div>
                         <div 
                            onClick={() => setToggles(p => ({...p, relance: !p.relance}))}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.relance ? 'bg-qgreen' : 'bg-qgrey-2'}`}
                         >
                             <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${toggles.relance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                     </div>
                     <p className="text-sm text-qtext-mid font-medium leading-relaxed mb-6">
                         Ce robot analyse les quittances impayées le 5 du mois et envoie automatiquement un SMS courtois au locataire incluant un lien Webpay sécurisé.
                     </p>
                     <div className="flex items-center gap-4 border-t border-qgrey-2 pt-4">
                         <span className="bg-qgrey-1 text-qtext-mid px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">Canal: SMS</span>
                         <span className="bg-qgreen-pale text-qgreen px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">{toggles.relance ? 'Actif' : 'En Pause'}</span>
                     </div>
                </div>

                {/* Workflow Card 2 */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-purple-400 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                                 <Mail size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-qnavy-dark">Génération Avis d'Échéance</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-qtext-light mt-1 flex items-center gap-1"><Clock size={10}/> Dernier jour du mois à 23:55</p>
                             </div>
                         </div>
                         <div 
                            onClick={() => setToggles(p => ({...p, quittance: !p.quittance}))}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.quittance ? 'bg-qgreen' : 'bg-qgrey-2'}`}
                         >
                             <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${toggles.quittance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                     </div>
                     <p className="text-sm text-qtext-mid font-medium leading-relaxed mb-6">
                         Le moteur fiscal QAPRIL calcule les quotes-parts TTC, génère le document PDF inviolable, et l'envoie en notification in-app au locataire.
                     </p>
                     <div className="flex items-center gap-4 border-t border-qgrey-2 pt-4">
                         <span className="bg-qgrey-1 text-qtext-mid px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">Canal: In-App / Mail</span>
                         <span className="bg-qgreen-pale text-qgreen px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">{toggles.quittance ? 'Actif' : 'En Pause'}</span>
                     </div>
                </div>

                {/* Workflow Card 3 */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-red-400 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100">
                                 <AlertTriangle size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-qnavy-dark">Expiration d'Assurance (GLI/MR)</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-qtext-light mt-1 flex items-center gap-1"><Clock size={10}/> Quotidien (T-30 jours)</p>
                             </div>
                         </div>
                         <div 
                            onClick={() => setToggles(p => ({...p, assurance: !p.assurance}))}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.assurance ? 'bg-qgreen' : 'bg-qgrey-2'}`}
                         >
                             <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${toggles.assurance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                     </div>
                     <p className="text-sm text-qtext-mid font-medium leading-relaxed mb-6">
                         Détecte les polices d'assurance locatives arrivant à échéance dans les 30 jours et somme le locataire de mettre à jour son document sous peine de pénalités.
                     </p>
                     <div className="flex items-center gap-4 border-t border-qgrey-2 pt-4">
                         <span className="bg-qgrey-1 text-qtext-mid px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">Canal: Email/SMS</span>
                         <span className="bg-qgreen-pale text-qgreen px-3 py-1 rounded-[4px] text-[10px] font-black uppercase">{toggles.assurance ? 'Actif' : 'En Pause'}</span>
                     </div>
                </div>
            </div>

            {/* Orchestrator Banner */}
            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 text-white relative shadow-lg overflow-hidden flex items-center justify-between">
                <Settings2 size={120} className="absolute -left-10 text-white opacity-5 animate-spin-slow" />
                <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black mb-1">QAPRIL Orchestrator Engine</h3>
                        <p className="text-sm text-gray-400 font-medium max-w-xl">
                            Nos instances Cron tournent en continu côté serveur (BullMQ/Redis) pour garantir la stricte exécution de vos mandats, même quand l'agence est fermée de nuit.
                        </p>
                    </div>
                    <button className="bg-white/10 hover:bg-white border border-white/20 hover:text-qnavy text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shrink-0 backdrop-blur-md">
                        Créer Script Custom
                    </button>
                </div>
            </div>
        </div>
    )
}
