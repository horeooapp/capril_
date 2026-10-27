"use client"

import React, { useState, useTransition } from "react"
import { X, Download, FileSpreadsheet, ShieldAlert, CheckCircle2, HelpCircle, FileText, Info } from "lucide-react"
import { toast } from "sonner"
import { exportDgiData } from "@/actions/receipt.actions"

interface DgiExportModalProps {
    isOpen: boolean
    onClose: () => void
    activeLeases?: any[]
}

export default function DgiExportModal({
    isOpen,
    onClose,
    activeLeases = []
}: DgiExportModalProps) {
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState<number>(currentYear)
    const [isPending, startTransition] = useTransition()

    if (!isOpen) return null

    // Estimation des montants annuels pour les baux actifs
    const baseAnnuelleEstimee = activeLeases.reduce((acc, l) => {
        const loyer = Number(l.rentAmount || 0)
        return acc + (loyer * 12)
    }, 0)

    const droitsDgiEstimes = Math.round(baseAnnuelleEstimee * 0.025)

    const handleDownload = () => {
        startTransition(async () => {
            try {
                const res = await exportDgiData(selectedYear)
                if (res.error) {
                    toast.error(res.error)
                    return
                }

                if (!res.csvContent) {
                    toast.error("Aucune donnée disponible pour l'année sélectionnée.")
                    return
                }

                // Déclenchement du téléchargement navigateur direct
                const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", res.filename || `declaration_dgi_${selectedYear}_qapril.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                toast.success(`Fichier fiscal DGI ${selectedYear} téléchargé avec succès !`)
                onClose()
            } catch (err: any) {
                toast.error("Erreur lors du téléchargement : " + (err.message || "Veuillez réessayer."))
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-emerald-600">
                            <FileSpreadsheet size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                Déclaration Fiscale DGI (Côte d'Ivoire)
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                Export officiel du registre des baux et calcul des droits d'enregistrement (2,5%)
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

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
                    
                    {/* Notice légale claire */}
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs uppercase tracking-wide">
                            <Info size={16} className="text-emerald-700" />
                            <span>Conformité avec la Direction Générale des Impôts (DGI)</span>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                            En Côte d'Ivoire, les propriétaires et gestionnaires immobiliers doivent déclarer annuellement leurs revenus locatifs. 
                            Selon <strong>l'article 550 du Code Général des Impôts (CGI)</strong>, le droit d'enregistrement fiscal est fixé à <strong>2,5% du montant brut annuel des loyers</strong>.
                        </p>
                    </div>

                    {/* Choix de l'année fiscale */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Année fiscale concernée
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                            >
                                <option value={currentYear}>Exercice {currentYear} (En cours)</option>
                                <option value={currentYear - 1}>Exercice {currentYear - 1} (Année précédente)</option>
                                <option value={currentYear - 2}>Exercice {currentYear - 2}</option>
                                <option value={currentYear - 3}>Exercice {currentYear - 3}</option>
                            </select>
                            <span className="text-xs text-slate-500">
                                Le fichier regroupera tous les baux enregistrés et quittances émises sur cette période.
                            </span>
                        </div>
                    </div>

                    {/* Synthèse des calculs fiscaux */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Baux déclarés</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{activeLeases.length}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Biens en location</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Loyers bruts annuels</p>
                            <p className="text-xl font-black text-slate-900 mt-1">
                                {baseAnnuelleEstimee.toLocaleString()} XOF
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Base imposable estimée</p>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Droit DGI (2,5%)</p>
                            <p className="text-xl font-black text-emerald-700 mt-1">
                                {droitsDgiEstimes.toLocaleString()} XOF
                            </p>
                            <p className="text-[10px] text-emerald-600 mt-0.5">À régler au fisc</p>
                        </div>
                    </div>

                    {/* Colonnes incluses dans le fichier */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                            Contenu du fichier exporté (Format Excel & CSV universel) :
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 text-[11px]">
                            <li className="flex items-center gap-1.5">✓ Référence officielle du bail</li>
                            <li className="flex items-center gap-1.5">✓ Adresse & Commune du bien</li>
                            <li className="flex items-center gap-1.5">✓ Nom du propriétaire bailleur</li>
                            <li className="flex items-center gap-1.5">✓ Nom & Contact du locataire</li>
                            <li className="flex items-center gap-1.5">✓ Loyer mensuel & Charges</li>
                            <li className="flex items-center gap-1.5">✓ Total annuel facturé & encaissé</li>
                            <li className="flex items-center gap-1.5">✓ Droits d'enregistrement DGI 2,5%</li>
                            <li className="flex items-center gap-1.5">✓ Statut de déclaration fiscale</li>
                        </ul>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors uppercase tracking-wider"
                    >
                        Fermer
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isPending}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                    >
                        {isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Génération du fichier...</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                <span>Télécharger le Fichier DGI (.csv)</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    )
}
