"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Calendar, Calculator, CheckCircle2, AlertCircle, Building2, User, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { generateNextMonthReceipts } from "@/actions/receipt.actions"

interface GenerateNextMonthModalProps {
    isOpen: boolean
    onClose: () => void
    activeLeases: any[]
    onSuccess?: () => void
}

export default function GenerateNextMonthModal({
    isOpen,
    onClose,
    activeLeases = [],
    onSuccess
}: GenerateNextMonthModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Default target month: M+1
    const [targetMonth, setTargetMonth] = useState<string>(() => {
        const d = new Date()
        const nextMonthDate = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        return `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`
    })

    if (!isOpen) return null

    // Compute total estimated rent for eligible active leases
    const totalEstimatedRent = activeLeases.reduce((acc, lease) => {
        const rent = Number(lease.rentAmount || 0)
        const charges = Number(lease.chargesAmount || 0)
        return acc + rent + charges
    }, 0)

    // Formatted month label in French (e.g. "Novembre 2026")
    const formattedMonth = (() => {
        try {
            const [year, month] = targetMonth.split("-")
            const date = new Date(parseInt(year), parseInt(month) - 1, 1)
            return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        } catch {
            return targetMonth
        }
    })()

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                const res = await generateNextMonthReceipts(targetMonth)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success(res.message || "Avis d'échéance générés avec succès !")
                    onClose()
                    onSuccess?.()
                    router.refresh()
                }
            } catch (err: any) {
                toast.error("Une erreur inattendue est survenue : " + (err.message || "Veuillez réessayer."))
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-sky-600">
                            <Calculator size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                Facturation Mensuelle Automatique
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                Émission des avis d'échéance de loyer pour le mois prochain (M+1)
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

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
                    
                    {/* Explication pédagogique */}
                    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar size={18} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                                À quoi sert cette action ?
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Cette opération prépare et enregistre en base de données les avis d'échéance de loyer pour vos locataires ayant un bail actif. Vos locataires verront leur quittance en attente de règlement avec le décompte exact du loyer et des charges.
                            </p>
                        </div>
                    </div>

                    {/* Sélection du mois cible */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Mois calendaire à facturer
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                type="month"
                                value={targetMonth}
                                onChange={(e) => setTargetMonth(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-slate-50/50"
                            />
                            <div className="text-xs font-semibold text-sky-700 bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200/60 uppercase tracking-wide">
                                📅 Période ciblée : <span className="font-bold capitalize">{formattedMonth}</span>
                            </div>
                        </div>
                    </div>

                    {/* Synthèse du portefeuille éligible */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Baux actifs éligibles</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{activeLeases.length}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Contrats actuellement en cours</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Montant total prévisionnel</p>
                            <p className="text-2xl font-black text-emerald-600 mt-1">
                                {totalEstimatedRent.toLocaleString()} XOF
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Loyers + charges mensuelles</p>
                        </div>
                    </div>

                    {/* Aperçu des baux qui seront facturés */}
                    {activeLeases.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Aperçu des logements concernés ({activeLeases.length})
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                                {activeLeases.map((lease) => {
                                    const total = Number(lease.rentAmount || 0) + Number(lease.chargesAmount || 0)
                                    const tenantName = lease.tenant ? `${lease.tenant.firstName || ''} ${lease.tenant.lastName || ''}`.trim() : "Locataire"
                                    const propertyName = lease.property?.name || lease.property?.address || "Logement"
                                    const commune = lease.property?.commune

                                    return (
                                        <div key={lease.id} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                                    <Building2 size={14} className="text-slate-400" />
                                                    <span>{propertyName}</span>
                                                    {commune && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                                            {commune}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                                    <User size={13} className="text-slate-400" />
                                                    <span>{tenantName}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="font-mono text-[11px] text-slate-400">{lease.leaseReference || lease.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-slate-900">{total.toLocaleString()} XOF</div>
                                                <div className="text-[10px] text-slate-400">loyer mensuel</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                            <AlertCircle size={20} className="shrink-0 text-amber-600" />
                            <div>
                                <p className="font-bold">Aucun bail actif trouvé</p>
                                <p className="mt-0.5">Vous devez disposer d'au moins un bail actif pour pouvoir émettre des avis d'échéance.</p>
                            </div>
                        </div>
                    )}

                    {/* Garantie de sécurité anti-doublon */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                        <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                        <span>
                            <strong>Sécurité anti-doublon :</strong> Tout logement ayant déjà reçu une quittance ou un avis pour ce mois sera automatiquement ignoré.
                        </span>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors uppercase tracking-wider"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending || activeLeases.length === 0}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                    >
                        {isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Génération en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Générer les avis de loyer</span>
                                <ArrowRight size={15} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    )
}
