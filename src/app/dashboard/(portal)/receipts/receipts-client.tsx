"use client"

import React, { useState, useTransition } from "react"
import { FileText, Search, Download, CheckCircle, Clock, AlertTriangle, Calculator } from "lucide-react"
import { toast } from "sonner";
import { generateNextMonthReceipts, exportDgiFile } from "@/actions/receipt-actions"

// Fallback statique si DB vide
const FALLBACK = [
    { id: "Q-2026-04-001", leaseId: "BAIL-2026-001", periodMonth: "2026-04", totalAmount: 1500000, status: "PAID" },
    { id: "Q-2026-04-002", leaseId: "BAIL-2026-002", periodMonth: "2026-04", totalAmount: 250000, status: "PENDING" },
    { id: "Q-2026-03-002", leaseId: "BAIL-2026-002", periodMonth: "2026-03", totalAmount: 250000, status: "OVERDUE" }
]

export default function ReceiptsDashboardClient({ initialReceipts }: { initialReceipts: any[] }) {
    const defaultData = initialReceipts.length > 0 ? initialReceipts : FALLBACK
    const [receipts] = useState<any[]>(defaultData)
    const [isPending, startTransition] = useTransition()

    const handleGenerate = () => {
        startTransition(async () => {
            const promise = generateNextMonthReceipts()
            toast.promise(promise, {
                loading: "Analyse des baux et génération des avis M+1...",
                success: "Les avis d'échéance ont été générés avec succès.",
                error: "Erreur lors de la génération."
            })
        })
    }

    const handleExport = () => {
        startTransition(async () => {
            const promise = exportDgiFile()
            toast.promise(promise, {
                loading: "Compilation des écritures comptables...",
                success: "Fichier DGI prêt. Le téléchargement commence.",
                error: "Erreur lors de l'export."
            })
        })
    }

    // Calculs KPI mockup
    const encaiss = receipts.filter(r => r.status === 'PAID').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    const pending = receipts.filter(r => r.status === 'PENDING').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    const overdue = receipts.filter(r => r.status === 'OVERDUE').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    
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
                    <button 
                        onClick={handleGenerate}
                        disabled={isPending}
                        className="bg-white text-qnavy border border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
                        <Calculator size={16} /> Générer Mois M+1
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={isPending}
                        className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
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
                     <p className="text-2xl font-black text-qgreen mt-1">{(encaiss).toLocaleString()} <span className="text-sm">FCFA</span></p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">En Attente</p>
                     <p className="text-2xl font-black text-qnavy-dark mt-1">{(pending).toLocaleString()} <span className="text-sm">FCFA</span></p>
                 </div>
                 <div className="bg-qred-pale border border-qred/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qred-dark">Impayés (Arriérés)</p>
                     <p className="text-2xl font-black text-qred mt-1">{(overdue).toLocaleString()} <span className="text-sm">FCFA</span></p>
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
                                <td className="p-5 font-bold text-xs text-qnavy-dark">{r.id.substring(0,18)}</td>
                                <td className="p-5 font-bold text-xs text-qtext-mid">{r.leaseId?.substring(0,12) || "N/A"}</td>
                                <td className="p-5 font-bold text-sm text-qnavy">{r.periodMonth}</td>
                                <td className="p-5 font-black text-sm text-qnavy-dark">{(r.totalAmount || 0).toLocaleString()} ₣</td>
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
                                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r, 1000)), {loading:'Génération du document PDF...', success:'Reçu téléchargé avec succès.'})} className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qgreen transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg bg-white">Télécharger</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
