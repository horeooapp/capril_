"use client"

import React from "react"
import { CreditCard, Check, Zap, Building2, Crown, BadgeCheck } from "lucide-react"

export default function BillingDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <CreditCard className="text-qnavy" size={32} /> Abonnements SaaS
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gérez le plan de votre plateforme QAPRIL V4.
                    </p>
                </div>
                <div className="bg-qgreen text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                    <BadgeCheck size={16} /> Compte Actif
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                 {/* Free Tier */}
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center relative">
                     <h3 className="text-xl font-black text-qtext-light uppercase tracking-widest mb-2">Essential</h3>
                     <div className="text-4xl font-black text-qnavy-dark mb-6">0 <span className="text-base text-qtext-mid font-bold">FCFA / mois</span></div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-sm font-medium text-qtext-mid">
                         <p className="flex items-center gap-3"><Check size={16} className="text-qgreen shrink-0"/> Jusqu'à 10 baux</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qgreen shrink-0"/> Quittances PDF basiques</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qgreen shrink-0"/> Support email</p>
                     </div>
                     
                     <button className="w-full mt-auto bg-qgrey-1 text-qtext-light px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                         Plan Actuel
                     </button>
                 </div>

                 {/* Premium Tier */}
                 <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] border border-qnavy rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center relative transform md:-translate-y-4">
                     <div className="absolute -top-4 bg-qorange text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">Recommandé</div>
                     <h3 className="text-xl font-black text-blue-300 uppercase tracking-widest mb-2">Premium Agency</h3>
                     <div className="text-4xl font-black text-white mb-6">45k <span className="text-base text-gray-400 font-bold">FCFA / mois</span></div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-sm font-medium text-gray-200">
                         <p className="flex items-center gap-3"><Check size={16} className="text-qorange shrink-0"/> Baux illimités</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qorange shrink-0"/> Automatisations & CRM inclus</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qorange shrink-0"/> Quittances certifiées avec Wallet Mobile Money</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qorange shrink-0"/> Comptabilité & Rapprochement Bancaire</p>
                     </div>
                     
                     <button className="w-full mt-auto bg-qorange text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg">
                         Mettre à niveau
                     </button>
                 </div>

                 {/* Enterprise Tier */}
                 <div className="bg-white border text-qnavy border-qgrey-2 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center relative">
                     <h3 className="text-xl font-black text-qtext-light uppercase tracking-widest mb-2">Enterprise</h3>
                     <div className="text-4xl font-black text-qnavy-dark mb-6">Sur Devis</div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-sm font-medium text-qtext-mid">
                         <p className="flex items-center gap-3"><Check size={16} className="text-qnavy shrink-0"/> Multi-Agences (Réseaux franchise)</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qnavy shrink-0"/> Instance BDD Dédiée</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qnavy shrink-0"/> Gestion Indivision / Syndic</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-qnavy shrink-0"/> API Access pour ERP Externe</p>
                     </div>
                     
                     <button className="w-full mt-auto bg-white border-2 border-qnavy text-qnavy px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy hover:text-white transition-colors">
                         Contacter Ventes
                     </button>
                 </div>
            </div>
            
            <div className="mt-8 bg-qgrey-1/50 border border-qgrey-2 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <CreditCard className="text-qnavy" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-qnavy-dark">Méthode de prélèvement</h4>
                        <p className="text-xs font-bold text-qtext-mid">Payez par Wave, Orange Money ou Carte Bancaire.</p>
                    </div>
                </div>
                <button className="bg-white text-qnavy border border-qgrey-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-qgrey-1 transition-all">Ajouter Paiement</button>
            </div>
        </div>
    )
}
