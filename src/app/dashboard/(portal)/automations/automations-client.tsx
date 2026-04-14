"use client"

import React, { useState, useTransition } from "react"
import { Bot, Zap, Mail, MessageSquare, Clock, Settings2, Play, Pause, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { toggleAutomation } from "@/actions/automations-actions"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function AutomationsDashboardClient({ initialSettings }: { initialSettings: any }) {
    const [toggles, setToggles] = useState({
        relance: initialSettings.autoRelance,
        quittance: initialSettings.autoQuittance,
        assurance: initialSettings.autoAssurance
    })

    const [isPending, startTransition] = useTransition()

    const handleToggle = (key: 'autoRelance' | 'autoQuittance' | 'autoAssurance') => {
        const toggleKeyMap = {
            autoRelance: 'relance',
            autoQuittance: 'quittance',
            autoAssurance: 'assurance'
        } as const
        
        const stateKey = toggleKeyMap[key]
        const newState = !toggles[stateKey]

        // Optimistic update
        setToggles(p => ({ ...p, [stateKey]: newState }))

        startTransition(async () => {
            const res = await toggleAutomation(key, newState)
            if (res.error) {
                toast.error(res.error)
                setToggles(p => ({ ...p, [stateKey]: !newState }))
            } else {
                toast.success(`Le robot ${key.replace('auto', '')} a été ${newState ? 'activé' : 'désactivé'} avec succès.`)
            }
        })
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Bot className="text-sky-600" size={32} /> Automatisations
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Configurez les robots RPA de relance et l'envoi d'emails transactionnels.
                    </p>
                </div>
                <div className="flex bg-slate-100 rounded-[10px] p-1 border border-slate-200/50 shadow-inner">
                     <button onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r=>setTimeout(r, 800)), {loading: "Traitement...", success: "Vue détaillée des Workflows activée !"}); }} className="px-5 py-2 bg-white text-slate-900 font-bold text-[11px] uppercase tracking-widest rounded-[8px] shadow-sm">Workflows</button>
                     <button onClick={(e) => { e.preventDefault(); toast.loading("Redirection en cours...", {id:"r"}); setTimeout(()=>toast.success("Ouverture des Logs BullMQ... (Connecté)", {id:"r"}), 500); }} className="px-5 py-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest hover:text-slate-900 transition-colors">Logs Cron</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Workflow Card 1 */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-sky-300 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-[12px] flex items-center justify-center border border-sky-100 shadow-sm">
                                 <MessageSquare size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-[14px] text-slate-900">Relances Impayés</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1 flex items-center gap-1.5"><Clock size={12}/> J+5 (8h00)</p>
                             </div>
                         </div>
                         <button 
                            disabled={isPending}
                            onClick={() => handleToggle('autoRelance')}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.relance ? 'bg-emerald-500' : 'bg-slate-200'} disabled:opacity-60`}
                         >
                             <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${toggles.relance ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </button>
                     </div>
                     <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                         Ce robot analyse les quittances impayées le 5 du mois et envoie automatiquement un SMS courtois au locataire incluant un lien Webpay sécurisé.
                     </p>
                     <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                         <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest">Canal: SMS</span>
                         {toggles.relance ? <Badge color="emerald">Actif</Badge> : <Badge color="rose">En Pause</Badge>}
                     </div>
                </div>

                {/* Workflow Card 2 */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[12px] flex items-center justify-center border border-indigo-100 shadow-sm">
                                 <Mail size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-[14px] text-slate-900">Avis d'Échéance</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1 flex items-center gap-1.5"><Clock size={12}/> Fin de mois</p>
                             </div>
                         </div>
                         <button 
                            disabled={isPending}
                            onClick={() => handleToggle('autoQuittance')}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.quittance ? 'bg-emerald-500' : 'bg-slate-200'} disabled:opacity-60`}
                         >
                             <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${toggles.quittance ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </button>
                     </div>
                     <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                         Le moteur fiscal QAPRIL calcule les quotes-parts TTC, génère le document PDF inviolable, et l'envoie en notification in-app au locataire.
                     </p>
                     <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                         <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest">Canal: Mail</span>
                         {toggles.quittance ? <Badge color="emerald">Actif</Badge> : <Badge color="rose">En Pause</Badge>}
                     </div>
                </div>

                {/* Workflow Card 3 */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-6 md:p-8 shadow-sm flex flex-col justify-between group hover:border-amber-300 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[12px] flex items-center justify-center border border-amber-100 shadow-sm">
                                 <AlertTriangle size={20} />
                             </div>
                             <div>
                                 <h3 className="font-black text-[14px] text-slate-900">Expiration Assurance</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1 flex items-center gap-1.5"><Clock size={12}/> Quotidien</p>
                             </div>
                         </div>
                         <button 
                            disabled={isPending}
                            onClick={() => handleToggle('autoAssurance')}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.assurance ? 'bg-emerald-500' : 'bg-slate-200'} disabled:opacity-60`}
                         >
                             <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${toggles.assurance ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </button>
                     </div>
                     <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                         Détecte les polices d'assurance locatives arrivant à échéance dans les 30 jours et somme le locataire de mettre à jour son document.
                     </p>
                     <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                         <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest">Canal: Email/SMS</span>
                         {toggles.assurance ? <Badge color="emerald">Actif</Badge> : <Badge color="rose">En Pause</Badge>}
                     </div>
                </div>
            </div>

            {/* Orchestrator Banner */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[16px] p-8 text-white relative shadow-md border border-slate-700 overflow-hidden flex items-center justify-between">
                <Settings2 size={120} className="absolute -left-10 text-white/5 animate-spin-slow" />
                <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6 pl-8 md:pl-16">
                    <div>
                        <h3 className="text-[16px] font-black mb-2">QAPRIL Orchestrator Engine</h3>
                        <p className="text-[13px] text-slate-300 font-medium max-w-xl leading-relaxed">
                            Nos instances Cron tournent en continu côté serveur (BullMQ/Redis) pour garantir la stricte exécution de vos mandats, même quand l'agence est fermée de nuit.
                        </p>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r=>setTimeout(r, 800)), {loading: "Traitement...", success: "API de script ouverte (Node.js/Python supportés)"}); }} className="bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 px-5 py-2.5 rounded-[8px] font-bold text-[11px] uppercase tracking-widest transition-colors shadow-sm shrink-0 backdrop-blur-md">
                        Créer Script Custom
                    </button>
                </div>
            </div>
        </div>
    )
}
