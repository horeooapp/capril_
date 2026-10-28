"use client"

import React, { useState, useTransition } from "react"
import { X, FileText, Calculator, Plus, User, Building2, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createFinancialReport } from "@/actions/report-actions"

interface CreateFinancialReportModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export default function CreateFinancialReportModal({
    isOpen,
    onClose,
    onSuccess
}: CreateFinancialReportModalProps) {
    const [isPending, startTransition] = useTransition()

    const now = new Date()
    const defaultPeriod = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    const [ownerName, setOwnerName] = useState("Koffi Amadou")
    const [period, setPeriod] = useState(defaultPeriod)
    const [propertiesCount, setPropertiesCount] = useState(1)
    const [totalGross, setTotalGross] = useState(150000)
    const [agencyFee, setAgencyFee] = useState(12000)
    const [tva, setTva] = useState(2160)
    const [repairCosts, setRepairCosts] = useState(0)
    const [status, setStatus] = useState("EN_ATTENTE")

    if (!isOpen) return null

    // Recalcul automatique lorsque le loyer brut change
    const handleGrossChange = (amount: number) => {
        setTotalGross(amount)
        const fee = Math.round(amount * 0.08)
        setAgencyFee(fee)
        setTva(Math.round(fee * 0.18))
    }

    const netPayout = Math.max(0, totalGross - agencyFee - tva - repairCosts)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!ownerName.trim()) {
            toast.error("Veuillez renseigner le nom du propriétaire mandant.")
            return
        }

        if (totalGross <= 0) {
            toast.error("Le loyer brut doit être supérieur à 0 XOF.")
            return
        }

        startTransition(async () => {
            const res = await createFinancialReport({
                ownerName,
                period,
                propertiesCount,
                totalGross,
                agencyFee,
                tva,
                repairCosts,
                status
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Compte Rendu de Gestion (CRG) enregistré avec succès !")
                onClose()
                onSuccess?.()
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-emerald-600">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                Nouveau Compte Rendu de Gestion (CRG)
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                Établir un bordereau de reversement mensuel pour un propriétaire
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isPending}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
                    
                    {/* Propriétaire Mandant */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Propriétaire Mandant <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            placeholder="Nom et prénom du propriétaire (ex: Koffi Amadou)"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Période & Nombre de biens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Mois / Exercice <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                placeholder="Ex: Octobre 2026"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Nombre de biens gérés
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={propertiesCount}
                                onChange={(e) => setPropertiesCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Décomposition Financière */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    Loyer brut global (XOF) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={totalGross}
                                    onChange={(e) => handleGrossChange(Number(e.target.value))}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    Honoraires de gestion (8%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={agencyFee}
                                    onChange={(e) => setAgencyFee(Number(e.target.value))}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    TVA sur honoraires (18%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={tva}
                                    onChange={(e) => setTva(Number(e.target.value))}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    Travaux & réparations déduits
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={repairCosts}
                                    onChange={(e) => setRepairCosts(Number(e.target.value))}
                                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-amber-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Net à reverser calculé en direct */}
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-white p-3 rounded-xl">
                            <div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                                    Net à virer au propriétaire :
                                </span>
                                <span className="text-[10px] text-slate-400">Après déduction des honoraires et taxes</span>
                            </div>
                            <span className="text-xl font-black text-emerald-700">
                                {netPayout.toLocaleString()} XOF
                            </span>
                        </div>
                    </div>

                    {/* Statut initial */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Statut du reversement
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus("EN_ATTENTE")}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                                    status === "EN_ATTENTE"
                                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                ⏳ En Attente de Virement
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus("PAYE")}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                                    status === "PAYE"
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                ✅ Déjà Réglé / Virement fait
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-wider"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 uppercase tracking-wider"
                        >
                            {isPending ? "Enregistrement..." : "Créer le Compte Rendu"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}
