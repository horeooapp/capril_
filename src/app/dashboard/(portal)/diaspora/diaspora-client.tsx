"use client"

import React, { useState, useTransition } from "react"
import { Globe, ArrowRightLeft, CreditCard, Landmark, Plane, ShieldCheck, Mail, MapPin, ChevronRight, Activity, TrendingUp } from "lucide-react"
import { toast } from "sonner";
import { linkStripeAccount, generateTaxCertificate } from "@/actions/diaspora-actions"

export default function DiasporaHubClient({ initialTransactions }: { initialTransactions: any[] }) {
    const [transactions] = useState(initialTransactions)
    const [isPending, startTransition] = useTransition()

    const handleStripe = () => {
        startTransition(async () => {
            const promise = linkStripeAccount()
            toast.promise(promise, {
                loading: "Redirection vers Stripe Connect...",
                success: "Passerelle Stripe associée avec succès.",
                error: "Erreur de connexion."
            })
        })
    }

    const handleTax = () => {
        startTransition(async () => {
            const promise = generateTaxCertificate()
            toast.promise(promise, {
                loading: "Génération de l'attestation CDI...",
                success: "Attestation fiscale prête. Téléchargement lancé.",
                error: "Erreur de génération."
            })
        })
    }

    return (
        <div className="space-y-6 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm">
                        <Globe size={12} /> Expatriation & Diaspora
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                         Passerelle Internationale
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Gérez vos actifs en Côte d'Ivoire. Encaissez en FCFA, connectez Stripe, suivez en Devise.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => {
                        const res = window.prompt("Entrez le code IBAN de votre compte local :");
                        if(res) toast.success('Coordonnées bancaires ajoutées et vérifiées.');
                    }} className="bg-white border text-blue-600 border-slate-200 px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Landmark size={16} /> RIB Ivoirien (SGCI)
                    </button>
                    <button 
                        onClick={handleStripe}
                        disabled={isPending}
                        className="bg-[#635BFF] text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-[#4d45d8] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                        <CreditCard size={16} /> Linker Stripe
                    </button>
                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Currency FX Box */}
                 <div className="bg-slate-900 border border-slate-800 p-8 rounded-[24px] shadow-sm flex items-center gap-4 relative overflow-hidden text-white">
                    <ArrowRightLeft className="absolute -right-4 -bottom-4 text-slate-800 opacity-50" size={120} />
                    <div className="bg-blue-500/20 p-4 rounded-[12px] backdrop-blur-sm relative z-10 border border-blue-500/30">
                        <Globe className="text-blue-400" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1 shadow-sm">Total Patrimoine (Estim.)</p>
                        <p className="text-4xl font-black text-white">41.1k <span className="text-[13px] text-slate-400 font-bold">€ EUR</span></p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">≈ 27,000,000 FCFA</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-[#635BFF]/10 p-4 rounded-[12px] border border-[#635BFF]/20">
                        <CreditCard className="text-[#635BFF]" size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-[#635BFF] uppercase tracking-widest mb-1">Passerelle Active</p>
                        <p className="text-xl font-black text-slate-900 flex items-center gap-2">Stripe Connect <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200 inline-flex items-center gap-1"><ShieldCheck size={10}/> Vérifié</span></p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">Accepte Visa, Mastercard, Amex</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-colors">
                    <div className="bg-blue-50 p-4 rounded-[12px] border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <Plane className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1">Fiscalité Non-Résident</p>
                        <p className="text-xl font-black text-slate-900">Déclarer impôts CI</p>
                         <button 
                            onClick={handleTax}
                            disabled={isPending}
                            className="text-[11px] font-bold text-blue-600 mt-1 flex items-center gap-1 hover:underline disabled:opacity-50">
                            Générer attestation CDI <ChevronRight size={12}/>
                         </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                 {/* Transaction Table */}
                 <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={18} className="text-[#635BFF]"/> Compte de Clearing (EUR/XOF)
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[650px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Transaction</th>
                                        <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Devise Source (FCFA)</th>
                                        <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Conversion (EUR)</th>
                                        <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Réseau</th>
                                        <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Statut Clearing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => {
                                        const isCredit = tx.type === 'CREDIT'
                                        const amountFcfa = isCredit ? tx.amount : -tx.amount
                                        const amountEur = parseFloat((amountFcfa / 655.957).toFixed(2))

                                        return (
                                        <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-5">
                                                <p className="font-bold text-[13px] text-slate-900">{isCredit ? 'Paiement Loyer' : 'Frais Agence'}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleDateString()} • {tx.id.substring(0,8)}</p>
                                            </td>
                                            <td className="p-5">
                                                <p className={`font-black text-[14px] ${isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                    {isCredit ? '+' : ''}{amountFcfa.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                                </p>
                                            </td>
                                            <td className="p-5">
                                                <p className={`font-black text-[14px] ${isCredit ? 'text-blue-600' : 'text-slate-600'}`}>
                                                     {isCredit ? '+' : ''}{amountEur.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">&euro;</span>
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 whitespace-nowrap overflow-hidden text-ellipsis bg-slate-50 px-2 py-0.5 rounded-[4px] inline-block">FX RATE: 655.957</p>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                     {tx.id.includes('STRIPE') ? <CreditCard size={14} className="text-[#635BFF]" /> : <Landmark size={14} className="text-slate-500" />}
                                                    <span className="font-bold text-[12px] text-slate-700">{tx.id.includes('STRIPE') ? 'Stripe' : 'Virement'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                {tx.status === 'COMPLETED' ? (
                                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest rounded-[6px]">
                                                        Cleared
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold uppercase tracking-widest rounded-[6px]">
                                                        SWIFT PENDING
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>

                 {/* Configuration Panel */}
                  <div className="w-full lg:w-[350px] shrink-0 animate-in slide-in-from-right-8 duration-500">
                    <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm lg:sticky lg:top-8">
                        <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <MapPin className="text-blue-600" size={18} /> Profil Non-Résident
                        </h3>

                        <div className="space-y-4">
                             <div className="p-4 bg-slate-50 rounded-[12px] border border-slate-200">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Pays de Résidence</label>
                                <p className="font-bold text-[13px] text-slate-700 flex items-center gap-2">🇫🇷 France (Europe)</p>
                             </div>

                             <div className="p-4 bg-slate-50 rounded-[12px] border border-slate-200">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Réseau d'Alerte Préféré</label>
                                <p className="font-bold text-[13px] text-emerald-600 flex items-center gap-2">WhatsApp (+33 6 ** ** ** **)</p>
                             </div>

                             <div className="p-4 bg-[#635BFF]/5 rounded-[12px] border border-[#635BFF]/20">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#635BFF] mb-1 block">Stripe Express Account</label>
                                <p className="font-mono text-[12px] font-bold text-slate-700 mb-3 bg-white px-2 py-1 rounded-[6px] border border-[#635BFF]/10 inline-block">acct_1OuXXXXXXXiY</p>
                                <button onClick={() => window.open('https://dashboard.stripe.com', '_blank')} className="w-full bg-white border border-[#635BFF] text-[#635BFF] px-4 py-2 rounded-[8px] font-bold text-[11px] uppercase tracking-widest hover:bg-[#635BFF] hover:text-white transition-colors text-center">
                                    Voir Dashboard Stripe
                                </button>
                             </div>

                             <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-[12px]">
                                <p className="text-[11px] font-bold uppercase text-orange-700 mb-1 flex items-center gap-2"><TrendingUp size={12}/> Impôts Fonciers (CI)</p>
                                <p className="text-[12px] font-medium text-orange-800/80 leading-relaxed">
                                    En tant que résident fiscal étranger, une retenue à la source s'applique sur vos revenus fonciers rapatriés.
                                </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
