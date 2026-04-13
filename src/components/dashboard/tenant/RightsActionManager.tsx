"use client"
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, MessageSquareWarning, FileSignature, Receipt, Gavel, FileLock2, Info, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitTenantRightRequest } from "@/actions/tenant-rights-actions";

export const RightsActionManager = ({ leaseId }: { leaseId: string }) => {
    const [activeAction, setActiveAction] = useState<any>(null);
    const [formData, setFormData] = useState({ subject: "", details: "" });
    const [isFormal, setIsFormal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rightsActions = [
        {
            id: "INTERVENTION",
            type: "MAINTENANCE",
            title: "Demande d'Intervention (Travaux)",
            description: "Plomberie, électricité, étanchéité. Signalez un sinistre à votre propriétaire via la règle d'assistance sécurisée (RCL-05).",
            icon: <MessageSquareWarning size={20} className="text-[#C55A11]" />,
            badge: "Délai 144h Max",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            id: "RECEIPT_CLAIM",
            type: "RECLAMATION",
            subType: "QUITTANCE",
            title: "Réclamation Quittance",
            description: "Paiement envoyé mais quittance certifiée manquante. Forcer l'édition avec preuve de paiement Mobile Money.",
            icon: <Receipt size={20} className="text-[#1F4E79]" />,
            badge: "Pénalité J+3",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            id: "PREAVIS",
            type: "PREAVIS",
            title: "Initier un préavis de sortie",
            description: "Annoncer de façon formelle et numérique votre intention de quitter les lieux (Délai légal de 1 mois en Côte d'Ivoire).",
            icon: <FileLock2 size={20} className="text-emerald-500" />,
            badge: "Avis Électronique",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        },
        {
            id: "SIGNALEMENT",
            type: "SIGNALEMENT",
            title: "Signalement Nuisance/Dégradation",
            description: "Signalez un problème de voisinage ou une dégradation des parties communes.",
            icon: <MessageSquareWarning size={20} className="text-red-500" />,
            badge: "Alerte Sécurisée",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    ];

    const handleSubmit = async () => {
        if (!formData.details) {
            toast.error("Veuillez fournir des détails sur votre requête.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitTenantRightRequest({
                type: activeAction.type as any,
                leaseId: leaseId,
                data: {
                    ...formData,
                    isFormal: isFormal || activeAction.type !== "RECLAMATION", // Forcé formel pour maintenance/préavis
                    subType: activeAction.subType,
                    dateDepart: formData.details // Simplification pour le préavis
                }
            });

            if (res.success) {
                toast.success("Demande transmise avec succès !");
                setActiveAction(null);
                setFormData({ subject: "", details: "" });
                window.location.reload(); // Recharger pour voir l'historique
            } else {
                toast.error(res.error || "Erreur lors de la soumission.");
            }
        } catch (error) {
            toast.error("Erreur de communication.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            onClick={() => {
                                setActiveAction(action);
                                setIsFormal(action.type === "RECLAMATION" ? false : true);
                            }}
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

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Description</label>
                                    <textarea 
                                        rows={4}
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        placeholder={activeAction.type === "PREAVIS" ? "Précisez votre date de départ..." : "Veuillez fournir un maximum de détails..."}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C55A11] transition-colors resize-none" 
                                    />
                                </div>

                                {activeAction.id === "RECEIPT_CLAIM" && (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Type d'action</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => setIsFormal(false)}
                                                className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isFormal ? "bg-qnavy text-white" : "bg-white border border-slate-200 text-slate-400"}`}
                                            >
                                                Rappel Simple
                                            </button>
                                            <button 
                                                onClick={() => setIsFormal(true)}
                                                className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isFormal ? "bg-qnavy text-white" : "bg-white border border-slate-200 text-slate-400"}`}
                                            >
                                                Litige Formel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className={`p-4 rounded-xl flex gap-3 ${isFormal ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"}`}>
                                    <ShieldCheck size={16} className={`${isFormal ? "text-red-500" : "text-blue-500"} shrink-0 mt-0.5`} />
                                    <p className={`text-[10px] ${isFormal ? "text-red-500" : "text-blue-500"} font-bold uppercase tracking-widest leading-tight`}>
                                        {isFormal 
                                            ? "Attention : Cette action ouvre un dossier juridique officiel susceptible d'impacter le score ICL du propriétaire." 
                                            : "Note : Un simple rappel automatique sera envoyé par notification au bailleur sans ouvrir de litige."}
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        disabled={isSubmitting}
                                        onClick={() => setActiveAction(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                        className="flex-1 py-4 bg-[#1F4E79] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-900 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Envoi..." : "Soumettre"}
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
