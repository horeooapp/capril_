"use client";

import React, { useState } from 'react';
import { ShieldCheck, MessageSquareWarning, FileSignature, Receipt, Gavel, FileLock2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const RightsActionManager = () => {
    const [activeAction, setActiveAction] = useState<any>(null);

    const rightsActions = [
        {
            id: "INTERVENTION",
            title: "Demande d'Intervention (Travaux)",
            description: "Plomberie, électricité, étanchéité. Signalez un sinistre à votre propriétaire via la règle d'assistance sécurisée (RCL-05).",
            icon: <MessageSquareWarning size={20} className="text-[#C55A11]" />,
            badge: "Délai 144h Max",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            id: "CONTEST",
            title: "Contester une modification",
            description: "Opposition à une hausse de loyer ou modification de bail non justifiée. La règle MRL-01 requiert votre consentement formel.",
            icon: <FileSignature size={20} className="text-red-500" />,
            badge: "Suspension",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        },
        {
            id: "RECEIPT_CLAIM",
            title: "Réclamation Quittance",
            description: "Paiement envoyé mais quittance certifiée manquante. Forcer l'édition avec preuve de paiement Mobile Money.",
            icon: <Receipt size={20} className="text-[#1F4E79]" />,
            badge: "Pénalité J+3",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            id: "PREAVIS",
            title: "Initier un préavis de sortie",
            description: "Annoncer de façon formelle et numérique votre intention de quitter les lieux (Délai légal de 1 mois en Côte d'Ivoire).",
            icon: <FileLock2 size={20} className="text-emerald-500" />,
            badge: "Avis Électronique",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        }
    ];

    return (
        <>
            <div>
                 <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                     <Info size={18} className="text-slate-400" /> Ouvrir un nouveau dossier
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {rightsActions.map((action, idx) => (
                         <button 
                            key={idx} 
                            onClick={() => setActiveAction(action)}
                            className={`flex flex-col text-left p-6 sm:p-8 rounded-[2rem] border ${action.borderColor} bg-white shadow-sm hover:shadow-lg transition-all group`}
                         >
                             <div className="flex justify-between items-start mb-4 w-full">
                                 <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                     {action.icon}
                                 </div>
                                 <span className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
                                     {action.badge}
                                 </span>
                             </div>
                             <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-widest mb-2 leading-tight">
                                 {action.title}
                             </h3>
                             <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                 {action.description}
                             </p>
                         </button>
                     ))}
                 </div>
            </div>

            <AnimatePresence>
                {activeAction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-slate-100"
                        >
                            <button 
                                onClick={() => setActiveAction(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 ${activeAction.bgColor} rounded-xl flex items-center justify-center`}>
                                    {activeAction.icon}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {activeAction.badge}
                                    </span>
                                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter leading-tight mt-1">
                                        {activeAction.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                                {activeAction.description}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Sujet de la requête</label>
                                    <input 
                                        type="text" 
                                        placeholder="Décrivez brièvement le problème..." 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C55A11] transition-colors" 
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Détails ou Preuve (URL/Info)</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Veuillez fournir un maximum de détails pour que le traitement soit rapide..." 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C55A11] transition-colors resize-none" 
                                    />
                                </div>

                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                                    <Info size={16} className="text-[#C55A11] shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-[#C55A11] font-bold uppercase tracking-widest leading-tight">
                                        Avertissement : Cette action est officielle. Le propriétaire sera notifié et un délai sera imposé pour sa réponse.
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => setActiveAction(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveAction(null);
                                            alert("Dossier d'assistance ouvert avec succès ! (Simulation)");
                                        }}
                                        className="flex-1 py-4 bg-[#1F4E79] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-900 transition-all shadow-lg"
                                    >
                                        Soumettre
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
