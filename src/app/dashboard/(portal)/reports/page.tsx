"use client"

import React, { useState } from "react"
import { FileText, Download, ChartPie, CheckCircle, Clock, Calendar, CheckSquare, Search, SendHorizontal, Calculator } from "lucide-react"
import { toast } from "sonner";

export default function ReportsDashboardPage() {
    const [crgs] = useState([
        {
            id: "CRG-2026-04-A",
            proprietaire: "Mme BA Adjoua",
            mois: "Avril 2026",
            biens: 2,
            loyersTotal: 850000,
            commission: 85000,
            tva: 15300,
            travaux: 0,
            net: 749700,
            statut: "EN_ATTENTE"
        },
        {
            id: "CRG-2026-04-B",
            proprietaire: "M. YAO Koffi",
            mois: "Avril 2026",
            biens: 1,
            loyersTotal: 300000,
            commission: 30000,
            tva: 5400,
            travaux: 15000,
            net: 249600,
            statut: "EN_ATTENTE"
        },
        {
            id: "CRG-2026-03-A",
            proprietaire: "Mme BA Adjoua",
            mois: "Mars 2026",
            biens: 2,
            loyersTotal: 850000,
            commission: 85000,
            tva: 15300,
            travaux: 50000,
            net: 699700,
            statut: "PAYE"
        }
    ])

    const totalNetAttente = crgs.filter(c => c.statut === "EN_ATTENTE").reduce((acc, c) => acc + c.net, 0)
    const totalComActuelle = crgs.filter(c => c.statut === "EN_ATTENTE").reduce((acc, c) => acc + c.commission, 0)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-gradient-to-r from-teal-400 to-qnavy text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ChartPie size={12} /> B2B Finance
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <FileText className="text-teal-500" size={32} /> Comptes Rendus (CRG)
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le récapitulatif comptable exact à reverser à vos propriétaires mandants.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Calendar size={16} /> Historique Mensuel
                    </button>
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md flex items-center gap-2">
                        <Calculator size={16} /> Clôturer Avril 2026
                    </button>
                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={10}/> Mois en cours</span>
                    <span className="text-xl font-black text-qnavy-dark">Avril 2026</span>
                </div>
                <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ChartPie size={10}/> Chiffre d'Affaire (Loyer Brut)</span>
                    <span className="text-xl font-black text-teal-700">1,150,000 <span className="text-[10px]">FCFA</span></span>
                </div>
                <div className="bg-qorange-pale p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CheckSquare size={10}/> Commissions Nettes Agence</span>
                    <span className="text-xl font-black text-orange-700">{totalComActuelle.toLocaleString()} <span className="text-[10px]">FCFA</span></span>
                </div>
                <div className="bg-[linear-gradient(135deg,#134E4A_0%,#0F172A_100%)] p-5 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
                    <span className="text-[9px] font-black text-teal-200 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-1.5"><SendHorizontal size={10}/> Net Restant à Virer (Proprios)</span>
                    <span className="text-2xl font-black text-white relative z-10">{totalNetAttente.toLocaleString()} <span className="text-sm">FCFA</span></span>
                    <Calculator className="absolute -right-4 -bottom-4 text-white opacity-10" size={80} />
                </div>
            </div>

            {/* CRG Table */}
            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        Bordereaux de Reversement
                    </h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Rechercher propriétaire..." className="w-full pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-bold" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Propriétaire & Mois</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Loyer Brut</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Retenues (Comm + TVA)</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Travaux</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-teal-600 bg-teal-50">NET À VIRER</th>
                                <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {crgs.map((c, i) => (
                                <tr key={c.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-qgrey-2 flex items-center justify-center font-bold text-xs text-qnavy">
                                                {c.proprietaire.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-qnavy-dark">{c.proprietaire}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black uppercase text-qtext-mid">{c.mois}</span>
                                                    <span className="w-1 h-1 rounded-full bg-qgrey-2"></span>
                                                    <span className="text-[10px] font-black text-qtext-light">{c.biens} Bien(s)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-sm text-qnavy">
                                        {c.loyersTotal.toLocaleString()} F
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-xs text-qred">-{c.commission.toLocaleString()} F</p>
                                        <p className="text-[9px] font-medium text-qtext-light mt-0.5">TVA: {c.tva.toLocaleString()} F</p>
                                    </td>
                                    <td className="p-4 font-bold text-xs text-orange-600">
                                        {c.travaux > 0 ? `-${c.travaux.toLocaleString()} F` : '-'}
                                    </td>
                                    <td className="p-4 bg-teal-50 font-black text-base text-teal-700">
                                        {c.net.toLocaleString()} F
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {c.statut === 'PAYE' ? (
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-qgreen-pale text-qgreen cursor-default" title="Reversement Effectué">
                                                    <CheckCircle size={14} />
                                                </span>
                                            ) : (
                                                <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-qorange-pale text-qorange hover:bg-orange-200 transition-colors" title="Payer (Reversement)">
                                                    <Clock size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-qgrey-2 text-qnavy hover:bg-qgrey-1 transition-colors group-hover:block" title="Télécharger PDF">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
