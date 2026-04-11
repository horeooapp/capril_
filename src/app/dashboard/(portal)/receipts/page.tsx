"use client"

import React, { useState } from "react"
import { FileText, Search, Download, CheckCircle, Clock, AlertTriangle, Calculator } from "lucide-react"
import { toast } from "sonner";

export default function ReceiptsDashboardPage() {
    const [receipts] = useState<any[]>([
        { id: "Q-2026-04-001", leaseId: "BAIL-2026-001", period: "Avril 2026", amount: "1,500,000", status: "PAID" },
        { id: "Q-2026-04-002", leaseId: "BAIL-2026-002", period: "Avril 2026", amount: "250,000", status: "PENDING" },
        { id: "Q-2026-03-002", leaseId: "BAIL-2026-002", period: "Mars 2026", amount: "250,000", status: "OVERDUE" }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <FileText className="text-qgreen" size={32} /> Quittances & Recouvrement
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le registre d'Avis d'Échéance, paiement WebPay et reçus officiels.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-white text-qnavy border border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Calculator size={16} /> Générer Mois M+1
                    </button>
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        <Download size={16} /> Exporter Fichier DGI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Taux Recouvrement</p>
                     <p className="text-3xl font-black text-qgreen mt-1">82%</p>
                 </div>
                 <div className="bg-qgreen-pale border border-qgreen/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qgreen-dark">Encaissé (Mois)</p>
                     <p className="text-3xl font-black text-qgreen mt-1">1.5M</p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">En Attente</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">250K</p>
                 </div>
                 <div className="bg-qred-pale border border-qred/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qred-dark">Impayés (Arriérés)</p>
                     <p className="text-3xl font-black text-qred mt-1">250K</p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex flex-col md:flex-row justify-between items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Référence Quittance..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">ID Quittance</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Contrat</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Période</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Montant TTC</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipts.map(r => (
                            <tr key={r.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer">
                                <td className="p-5 font-bold text-xs text-qnavy-dark">{r.id}</td>
                                <td className="p-5 font-bold text-xs text-qtext-mid">{r.leaseId}</td>
                                <td className="p-5 font-bold text-sm text-qnavy">{r.period}</td>
                                <td className="p-5 font-black text-sm text-qnavy-dark">{r.amount} ₣</td>
                                <td className="p-5">
                                    {r.status === 'PAID' && (
                                        <span className="text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            <CheckCircle size={10} /> Payée
                                        </span>
                                    )}
                                    {r.status === 'PENDING' && (
                                        <span className="text-[10px] font-black uppercase text-qorange bg-qorange-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            <Clock size={10} /> En attente
                                        </span>
                                    )}
                                    {r.status === 'OVERDUE' && (
                                        <span className="text-[10px] font-black uppercase text-qred bg-qred-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            <AlertTriangle size={10} /> Impayée
                                        </span>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qgreen transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg">Télécharger</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
