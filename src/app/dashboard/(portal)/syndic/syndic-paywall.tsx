"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Landmark, CheckCircle, ArrowRight, Loader2, ShieldCheck, Zap, Activity } from "lucide-react"
import { subscribeSyndicSaaS } from "@/actions/syndic-b2b.actions"
import { toast } from "sonner"

export default function SyndicPaywall() {
    const [isSubscribing, setIsSubscribing] = useState(false)

    const handleSubscribe = async () => {
        setIsSubscribing(true);
        try {
            const res = await subscribeSyndicSaaS();
            if (res.success) {
                toast.success("Abonnement activé avec succès ! Bienvenue dans l'espace Syndic.");
                window.location.reload();
            } else {
                toast.error(res.error || "Erreur lors de la souscription.");
            }
        } finally {
            setIsSubscribing(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-sky-200">
                    <Landmark size={40} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                    QAPRIL <span className="text-sky-600">Syndic Pro</span>
                </h1>
                <p className="text-[15px] font-medium text-slate-500 mt-4 max-w-2xl mx-auto">
                    La solution SaaS complète pour digitaliser la gestion de vos copropriétés. Appels de fonds automatisés, tenue des assemblées générales et comptabilité transparente.
                </p>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row relative">
                <div className="p-10 md:w-3/5 bg-slate-50">
                    <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-900 mb-6">Ce qui est inclus</h3>
                    <ul className="space-y-5">
                        <li className="flex items-start gap-4">
                            <div className="mt-1 bg-emerald-100 text-emerald-600 p-1 rounded-full"><CheckCircle size={16} /></div>
                            <div>
                                <p className="font-bold text-[13px] text-slate-900">Appels de Fonds Automatisés</p>
                                <p className="text-[12px] text-slate-500">Génération automatique des appels de fonds selon la clé de répartition.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="mt-1 bg-emerald-100 text-emerald-600 p-1 rounded-full"><CheckCircle size={16} /></div>
                            <div>
                                <p className="font-bold text-[13px] text-slate-900">Gestion des Assemblées Générales</p>
                                <p className="text-[12px] text-slate-500">Organisation, votes électroniques et génération des procès-verbaux.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="mt-1 bg-emerald-100 text-emerald-600 p-1 rounded-full"><CheckCircle size={16} /></div>
                            <div>
                                <p className="font-bold text-[13px] text-slate-900">Transparence Bancaire</p>
                                <p className="text-[12px] text-slate-500">Suivi des recouvrements et lettrage bancaire intégré.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div className="p-10 md:w-2/5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-center relative overflow-hidden">
                    <Zap size={150} className="absolute -bottom-10 -right-10 text-white opacity-5" />
                    
                    <div className="relative z-10 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400 mb-2">Abonnement Mensuel</p>
                        <h2 className="text-4xl font-black mb-2">25 000 <span className="text-xl">FCFA</span></h2>
                        <p className="text-[11px] text-slate-400 mb-8">Débité automatiquement depuis votre Wallet QAPRIL.</p>

                        <button 
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            className="w-full bg-sky-500 text-white py-4 rounded-[16px] font-black text-[13px] uppercase tracking-widest hover:bg-sky-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : "Activer mon accès"}
                            {!isSubscribing && <ArrowRight size={18} />}
                        </button>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Sans engagement de durée</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
