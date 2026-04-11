"use client"

import React, { useState } from "react"
import { Globe, ArrowRightLeft, CreditCard, Landmark, Plane, ShieldCheck, Mail, MapPin, ChevronRight, Activity, TrendingUp } from "lucide-react"

export default function DiasporaHubPage() {
    const [transactions] = useState([
        {
            id: "TX-STRIPE-08A",
            date: "14 Avril 2026",
            description: "Paiement Loyer (Appartement 4 - Bietry)",
            amountFcfa: 450000,
            amountEur: 686.02,
            method: "Stripe (Visa *4242)",
            status: "ENCAISSE"
        },
        {
            id: "TX-STRIPE-08B",
            date: "10 Avril 2026",
            description: "Frais de Gestion Agence",
            amountFcfa: -45000,
            amountEur: -68.60,
            method: "Virement SWIFT (SGCI)",
            status: "EN_ATTENTE"
        }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Globe size={12} /> Expatriation & Diaspora
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                         Passerelle Internationale
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gérez vos actifs en Côte d'Ivoire. Encaissez en FCFA, connectez Stripe, suivez en Devise.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border text-blue-600 border-blue-200 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2">
                        <Landmark size={16} /> RIB Ivoirien (SGCI)
                    </button>
                    <button className="bg-[#635BFF] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#4d45d8] transition-all shadow-md flex items-center gap-2">
                        <CreditCard size={16} /> Linker Stripe
                    </button>
                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Currency FX Box */}
                 <div className="bg-[linear-gradient(135deg,#020617_0%,#1e1b4b_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <ArrowRightLeft className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <Globe className="text-cyan-400" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 shadow-sm">Total Patrimoine (Estim.)</p>
                        <p className="text-3xl font-black text-white">41.1k <span className="text-sm opacity-80">€ EUR</span></p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">≈ 27,000,000 FCFA</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-[#e4e2fc] p-4 rounded-2xl border border-[#c4c0f8]">
                        <CreditCard className="text-[#635BFF]" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#635BFF] uppercase tracking-widest mb-1">Passerelle Active</p>
                        <p className="text-lg font-black text-qnavy-dark">Stripe Connect <span className="text-[10px] font-bold text-qgreen ml-2 inline-flex items-center gap-1"><ShieldCheck size={10}/> Vérifié</span></p>
                         <p className="text-[10px] font-bold text-qtext-mid mt-1">Accepte Visa, Mastercard, Amex</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-colors">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <Plane className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Fiscalité Non-Résident</p>
                        <p className="text-xl font-black text-qnavy-dark">Déclarer impôts CI</p>
                         <button className="text-[10px] font-bold text-blue-600 mt-1 flex items-center gap-1 hover:underline">Générer attestation CDI <ChevronRight size={10}/></button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                 {/* Transaction Table */}
                 <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                            <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                                <Activity size={18} className="text-[#635BFF]"/> Compte de Clearing (EUR/XOF)
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-qgrey-2">
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Libellé (Opération)</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Devise Source (FCFA)</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Conversion (EUR)</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Réseau de Paiement</th>
                                        <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right">Statut Clearing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-qgrey-2 hover:bg-[#635BFF]/5 transition-colors group">
                                            <td className="p-5">
                                                <p className="font-bold text-sm text-qnavy-dark">{tx.description}</p>
                                                <p className="text-[10px] font-black uppercase text-qtext-mid mt-0.5">{tx.date} • {tx.id}</p>
                                            </td>
                                            <td className="p-5">
                                                <p className={`font-black text-sm ${tx.amountFcfa > 0 ? 'text-qgreen' : 'text-qnavy'}`}>
                                                    {tx.amountFcfa > 0 ? '+' : ''}{tx.amountFcfa.toLocaleString()} <span className="text-[10px]">F</span>
                                                </p>
                                            </td>
                                            <td className="p-5">
                                                <p className={`font-black text-sm ${tx.amountEur > 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                                                     {tx.amountEur > 0 ? '+' : ''}{tx.amountEur.toLocaleString()} <span className="text-[10px]">&euro;</span>
                                                </p>
                                                <p className="text-[8px] font-black text-qtext-light uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">FX RATE: 655.957</p>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                     {tx.method.includes('Stripe') ? <CreditCard size={14} className="text-[#635BFF]" /> : <Landmark size={14} className="text-qnavy" />}
                                                    <span className="font-bold text-xs text-qnavy-dark">{tx.method}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                {tx.status === 'ENCAISSE' ? (
                                                    <span className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-qgreen-pale text-qgreen text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                        Cleared
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                        SWIFT PENDING
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>

                 {/* Configuration Panel */}
                  <div className="w-full lg:w-[350px] shrink-0 animate-in slide-in-from-right-8 duration-500">
                    <div className="bg-white rounded-[2rem] border border-qgrey-2 p-6 shadow-xl sticky top-8">
                        <h3 className="text-lg font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-qgrey-2 pb-4">
                            <MapPin className="text-blue-500" size={20} /> Profil Non-Résident
                        </h3>

                        <div className="space-y-4">
                             <div className="p-4 bg-qgrey-1 rounded-xl border border-qgrey-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-1 block">Pays de Résidence</label>
                                <p className="font-bold text-sm text-qnavy flex items-center gap-2">🇫🇷 France (Europe)</p>
                             </div>

                             <div className="p-4 bg-qgrey-1 rounded-xl border border-qgrey-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light mb-1 block">Réseau d'Alerte Préféré</label>
                                <p className="font-bold text-sm text-[#25D366] flex items-center gap-2">WhatsApp (+33 6 ** ** ** **)</p>
                             </div>

                             <div className="p-4 bg-[#635BFF]/5 rounded-xl border border-[#635BFF]/20">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#635BFF] mb-1 block">Stripe Express Account</label>
                                <p className="font-mono text-xs font-bold text-qnavy-dark mb-3">acct_1OuXXXXXXXiY</p>
                                <button className="w-full bg-white border border-[#635BFF] text-[#635BFF] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#635BFF] hover:text-white transition-all text-center">
                                    Voir Dashboard Stripe
                                </button>
                             </div>

                             <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                                <p className="text-[10px] font-black uppercase text-orange-800 mb-1 flex items-center gap-2"><TrendingUp size={12}/> Impôts Fonciers (CI)</p>
                                <p className="text-xs font-medium text-orange-900 leading-relaxed">
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
