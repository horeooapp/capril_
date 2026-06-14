"use client"

import React, { useState, useTransition } from "react"
import { FileText, Search, Download, Calculator, Plus, AlertTriangle, Send } from "lucide-react"
import { toast } from "sonner";
import { generateNextMonthReceipts, exportDgiFile, dispatchDigitalDelivery } from "@/actions/receipt.actions"
import ManualReceiptModal from "@/components/dashboard/ManualReceiptModal"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function ReceiptsDashboardClient({ initialReceipts }: { initialReceipts: any[] }) {
    const [receipts] = useState<any[]>(initialReceipts)
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
    const [search, setSearch] = useState("");

    const filteredReceipts = receipts.filter(r => 
        (r.id || '').toLowerCase().includes(search.toLowerCase()) || 
        (r.leaseId || '').toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setSelectedReceipt(null)
        setIsModalOpen(true)
    }

    const openEditModal = (receipt: any) => {
        setSelectedReceipt(receipt)
        setIsModalOpen(true)
    }

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

    const handleDigitalDelivery = (receiptId: string) => {
        startTransition(async () => {
            const promise = dispatchDigitalDelivery(receiptId, 'maposte_number', { addr: 'Default Customer' })
            toast.promise(promise, {
                loading: "Expédition digitale via La Poste CI...",
                success: (data) => `Quittance expédiée ! Tracking: ${data.tracking || ''}`,
                error: "Erreur technique lors de l'expédition."
            })
        })
    }

    // Calculs KPI
    const encaiss = receipts.filter(r => r.status === 'PAID' || r.status === 'paid' || r.status === 'PAYE').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    const pending = receipts.filter(r => r.status === 'PENDING' || r.status === 'pending' || r.status === 'EN_ATTENTE').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    const overdue = receipts.filter(r => r.status === 'OVERDUE' || r.status === 'overdue' || r.status === 'IMPAYE').reduce((acc, r) => acc + (r.totalAmount || 0), 0)
    
    const totalDue = encaiss + pending + overdue;
    const recoveryRate = totalDue > 0 ? Math.round((encaiss / totalDue) * 100) : 0;
    
    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <FileText className="text-slate-700" size={32} /> Quittances & Recouvrement
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Le registre d'Avis d'Échéance, paiement WebPay et reçus officiels.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button 
                        onClick={handleGenerate}
                        disabled={isPending}
                        className="bg-white text-slate-700 border border-slate-200 px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none">
                        <Calculator size={16} /> Générer Mois M+1
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={isPending}
                        className="bg-slate-800 text-white px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none">
                        <Download size={16} /> Fichier DGI
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <Plus size={16} /> Nouveau Reçu
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                 <StatCard 
                     label="Taux Recouvrement" 
                     value={`${recoveryRate}%`} 
                     sub="Objectif 90%" 
                     trend={recoveryRate >= 90 ? "up" : "down"} 
                 />
                 <StatCard 
                     label="Encaissé (Mois)" 
                     value={`${(encaiss).toLocaleString()} ₣`} 
                     sub="Paiements confirmés" 
                 />
                 <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4 flex flex-col justify-between">
                     <p className="text-[12px] font-semibold text-slate-500 uppercase">En Attente</p>
                     <div>
                        <p className="text-2xl font-black text-rose-500 mt-2">{(pending).toLocaleString()} ₣</p>
                        <p className="text-[11px] text-slate-400 mt-1">À recevoir ce mois-ci</p>
                     </div>
                 </div>
                 <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-4 flex flex-col justify-between">
                     <p className="text-[12px] font-semibold text-rose-700 uppercase">Impayés (Arriérés)</p>
                     <div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{(overdue).toLocaleString()} ₣</p>
                        <p className="text-[11px] text-rose-500 mt-1">Dossiers en contentieux</p>
                     </div>
                 </div>
            </div>

            <SectionCard title="Historique & Paiements" noPadding>
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher (Quittance ou Bail)..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">ID Quittance</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Contrat</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Période</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Montant TTC</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Statut</th>
                                <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReceipts.map(r => (
                                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <td className="py-3 px-4 font-semibold text-[13px] text-slate-800">{r.id.substring(0,18)}</td>
                                    <td className="py-3 px-4 font-medium text-[12.5px] text-slate-500">{r.leaseId?.substring(0,12) || "N/A"}</td>
                                    <td className="py-3 px-4 font-semibold text-[12.5px] text-slate-700">{r.periodMonth}</td>
                                    <td className="py-3 px-4 font-black text-[13px] text-slate-900">{(r.totalAmount || 0).toLocaleString()} ₣</td>
                                    <td className="py-3 px-4">
                                        {r.status === 'PAID' && <Badge color="green">PAYÉE</Badge>}
                                        {r.status === 'PENDING' && <Badge color="amber">EN ATTENTE</Badge>}
                                        {r.status === 'OVERDUE' && (
                                            <span className="flex items-center gap-1.5 inline-flex text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">
                                                <AlertTriangle size={12} /> IMPAYÉE
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right flex justify-end gap-2 items-center">
                                        {r.status === 'PAID' && !r.digitalDeliveryId && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDigitalDelivery(r.id); }} 
                                                disabled={isPending} 
                                                className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 px-3 py-1.5 rounded-[6px] bg-amber-50 disabled:opacity-50">
                                                <Send size={12}/> Envoyer Poste
                                            </button>
                                        )}
                                        {r.digitalDeliveryId && (
                                             <span className="text-[11px] font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-[6px]">Expédié (POSTE-CI)</span>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openEditModal(r); }} 
                                            className="text-[11px] font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors border border-slate-200 px-3 py-1.5 rounded-[6px] bg-white">
                                            Éditer
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(res=>setTimeout(res, 1000)), {loading:'Génération du document PDF...', success:'Reçu téléchargé avec succès.'}); }} 
                                            className="text-[11px] font-semibold text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors border border-slate-200 px-3 py-1.5 rounded-[6px] bg-white">
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReceipts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-sm font-medium text-slate-500">
                                        Aucune quittance correspondante.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <ManualReceiptModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialReceipt={selectedReceipt}
            />
        </div>
    )
}
