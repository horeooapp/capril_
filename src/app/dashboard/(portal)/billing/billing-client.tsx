"use client"

import React, { useTransition } from "react"
import { CreditCard, Check, Zap, Building2, Crown, BadgeCheck } from "lucide-react"
import { toast } from "sonner"
import { upgradeToPremium, requestEnterpriseContact } from "@/actions/billing-actions"

export default function BillingDashboardClient({ userPlan }: { userPlan: any }) {
    const [isPending, startTransition] = useTransition()
    
    // Safely parse actual active tier
    const currentTier = userPlan?.activePlanTier || "LOCATAIRE"

    const handleUpgradePremium = () => {
        startTransition(async () => {
            const res = await upgradeToPremium()
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Félicitations, votre abonnement a été mis à jour !')
            }
        })
    }

    const handleEnterprise = () => {
        startTransition(async () => {
            const res = await requestEnterpriseContact()
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Demande envoyée. Un conseiller vous contactera sous 24h.')
            }
        })
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <CreditCard className="text-slate-700" size={32} /> Abonnements SaaS
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Gérez le plan de votre plateforme QAPRIL V4.
                    </p>
                </div>
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                    <BadgeCheck size={16} /> Compte Actif
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                 {/* Free Tier */}
                 <div className={`bg-white border ${currentTier === 'ESSENTIEL' || currentTier === 'LOCATAIRE' ? 'border-emerald-500 border-2' : 'border-slate-200'} rounded-[16px] p-8 shadow-sm flex flex-col items-center text-center relative`}>
                     {(currentTier === 'ESSENTIEL' || currentTier === 'LOCATAIRE') && <div className="absolute -top-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">Plan Actuel</div>}
                     <h3 className="text-[15px] font-black text-slate-500 uppercase tracking-widest mb-2">Propriétaire</h3>
                     <div className="text-4xl font-black text-slate-900 mb-6">0 <span className="text-[13.5px] text-slate-500 font-bold">XOF / mois</span></div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-[13px] font-medium text-slate-600">
                         <p className="flex items-center gap-3"><Check size={16} className="text-emerald-500 shrink-0"/> Jusqu'à 10 baux</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-emerald-500 shrink-0"/> Quittances PDF certifiées</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-emerald-500 shrink-0"/> Facturation par quittance générée</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-emerald-500 shrink-0"/> Support email</p>
                     </div>
                     
                     <button disabled className="w-full mt-auto bg-slate-100 text-slate-400 px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest cursor-not-allowed">
                         {currentTier === 'ESSENTIEL' || currentTier === 'LOCATAIRE' ? 'Plan Actuel' : 'Plan Inférieur'}
                     </button>
                 </div>

                 {/* Premium Tier */}
                 <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border ${currentTier === 'PRO' ? 'border-emerald-500 border-2' : 'border-slate-700'} rounded-[16px] p-8 shadow-lg flex flex-col items-center text-center relative transform md:-translate-y-4`}>
                     <div className="absolute -top-4 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">Recommandé</div>
                     <h3 className="text-[15px] font-black text-sky-400 uppercase tracking-widest mb-2">Agence Intermédiaire</h3>
                     <div className="text-4xl font-black text-white mb-6">0 <span className="text-[13.5px] text-slate-400 font-bold">XOF / mois</span></div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-[13px] font-medium text-slate-300">
                         <p className="flex items-center gap-3"><Check size={16} className="text-amber-500 shrink-0"/> Baux illimités</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-amber-500 shrink-0"/> Automatisations & CRM inclus</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-amber-500 shrink-0"/> Facturation par quittance générée</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-amber-500 shrink-0"/> Comptabilité & Rapprochement Bancaire</p>
                     </div>
                     
                     {currentTier === 'PRO' ? (
                          <div className="w-full mt-auto bg-emerald-500 text-white px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
                            <BadgeCheck size={16} /> Plan Actuel
                          </div>
                     ) : (
                          <button 
                             disabled={isPending}
                             onClick={handleUpgradePremium} 
                             className="w-full mt-auto bg-amber-500 text-white px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
                             {isPending ? 'MAJ EN COURS...' : 'Mettre à niveau'}
                         </button>
                     )}
                 </div>

                 {/* Enterprise Tier */}
                 <div className={`bg-white border text-slate-900 ${currentTier === 'PREMIUM' ? 'border-emerald-500 border-2' : 'border-slate-200'} rounded-[16px] p-8 shadow-sm flex flex-col items-center text-center relative`}>
                     {currentTier === 'PREMIUM' && <div className="absolute -top-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">Plan Actuel</div>}
                     <h3 className="text-[15px] font-black text-slate-500 uppercase tracking-widest mb-2">Diaspora VIP</h3>
                     <div className="text-4xl font-black text-slate-900 mb-6">2 500 <span className="text-[13.5px] text-slate-500 font-bold">XOF / mois</span></div>
                     
                     <div className="space-y-4 mb-8 w-full text-left text-[13px] font-medium text-slate-600">
                         <p className="flex items-center gap-3"><Check size={16} className="text-slate-800 shrink-0"/> Tableau de bord VIP</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-slate-800 shrink-0"/> Rapports financiers mensuels</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-slate-800 shrink-0"/> Inspections vidéo à distance</p>
                         <p className="flex items-center gap-3"><Check size={16} className="text-slate-800 shrink-0"/> Gestionnaire terrain dédié</p>
                     </div>
                     
                     <button 
                         disabled={isPending || currentTier === 'PREMIUM'}
                         onClick={handleEnterprise}
                         className="w-full mt-auto bg-white border-2 border-slate-800 text-slate-800 px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50">
                         {currentTier === 'PREMIUM' ? 'Déjà Actif' : 'Activer Diaspora'}
                     </button>
                 </div>
            </div>
            
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-[16px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-[10px] shadow-sm flex items-center justify-center">
                        <CreditCard className="text-slate-800" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-black text-slate-900">Méthode de prélèvement</h4>
                        <p className="text-[12px] font-bold text-slate-500">Payez par Wave, Orange Money ou Carte Bancaire.</p>
                    </div>
                </div>
                <button onClick={() => window.location.href = "/dashboard/payments/simulate?tid=ABONNEMENT_UPGRADE&amount=45000"} className="bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm">Ajouter Paiement</button>
            </div>
        </div>
    )
}
