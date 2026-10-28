"use client"

import React from "react"
import { X, Printer, CheckCircle2, Clock, Building2, User, FileText, ArrowDownRight, ShieldCheck } from "lucide-react"

interface PrintableCrgModalProps {
    isOpen: boolean
    onClose: () => void
    report: any
}

export default function PrintableCrgModal({
    isOpen,
    onClose,
    report
}: PrintableCrgModalProps) {
    if (!isOpen || !report) return null

    const ref = `CRG-${report.id.slice(0, 8).toUpperCase()}`
    const isPaid = report.status === "PAYE"

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-w-none print:shadow-none print:border-none print:rounded-none">
                
                {/* Header (Hidden on Print) */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-emerald-600" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                            Bordereau de Reversement Mandant
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
                        >
                            <Printer size={14} /> Imprimer / PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Printable Document Body */}
                <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-sm bg-white print:p-12">
                    
                    {/* Official Banner */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                        <div>
                            <div className="text-2xl font-black tracking-tight text-slate-900">QAPRIL BUSINESS</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-0.5">
                                Gestion Immobilière & Compte Rendu Mandant
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Réf. Document</span>
                            <span className="text-base font-black font-mono text-slate-900">{ref}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                                Date : {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>

                    {/* Propriétaire Mandant & Période */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Bénéficiaire (Propriétaire)</span>
                            <span className="text-sm font-black text-slate-900 mt-1 block">{report.ownerName}</span>
                            <span className="text-xs text-slate-500">{report.propertiesCount} bien(s) en gérance active</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Exercice Comptable</span>
                            <span className="text-sm font-black text-slate-900 mt-1 block">{report.period}</span>
                            <div className="mt-1">
                                {isPaid ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={12} /> Réglé / Virement exécuté
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                        <Clock size={12} /> En attente de virement
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tableau des écritures financières */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                                    <th className="py-3 px-4">Désignation de l'écriture</th>
                                    <th className="py-3 px-4 text-center">Taux / Règle</th>
                                    <th className="py-3 px-4 text-right">Montant (XOF)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                <tr>
                                    <td className="py-3.5 px-4 font-bold text-slate-900">
                                        Loyer Brut Global Encaissé
                                        <span className="text-[10px] text-slate-400 block font-normal">Totalité des loyers perçus sur la période</span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-slate-500">100%</td>
                                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                                        +{Number(report.totalGross).toLocaleString()} XOF
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-700">
                                        Honoraires de Gestion Agence
                                        <span className="text-[10px] text-slate-400 block">Frais de mandat et suivi locatif</span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-slate-500">8%</td>
                                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                                        -{Number(report.agencyFee).toLocaleString()} XOF
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-700">
                                        TVA Réglementaire sur Honoraires
                                        <span className="text-[10px] text-slate-400 block">Taxe sur la Valeur Ajoutée (Côte d'Ivoire)</span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-slate-500">18%</td>
                                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                                        -{Number(report.tva).toLocaleString()} XOF
                                    </td>
                                </tr>
                                {Number(report.repairCosts) > 0 && (
                                    <tr>
                                        <td className="py-3 px-4 text-slate-700">
                                            Travaux & Entretien Déductibles
                                            <span className="text-[10px] text-slate-400 block">Dépenses engagées avec accord mandant</span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500">Réel</td>
                                        <td className="py-3 px-4 text-right font-bold text-amber-600">
                                            -{Number(report.repairCosts).toLocaleString()} XOF
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bloc Récapitulatif NET À REVERSER */}
                    <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex justify-between items-center text-emerald-950">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                                MONTANT NET À REVERSER AU PROPRIÉTAIRE
                            </span>
                            <span className="text-xs text-emerald-700">Virement bancaire ou Mobile Money</span>
                        </div>
                        <span className="text-3xl font-black text-emerald-800">
                            {Number(report.netPayout).toLocaleString()} XOF
                        </span>
                    </div>

                    {/* Mentions Légales & Cachet */}
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-600">Plateforme de Gestion Immobilière Intelligente QAPRIL</p>
                            <p>Registre du Commerce et du Crédit Mobilier (RCCM) • République de Côte d'Ivoire</p>
                            <p>Scellé cryptographiquement et certifié conforme aux écritures comptables.</p>
                        </div>
                        <div className="text-right border-2 border-dashed border-slate-300 p-3 rounded-xl">
                            <div className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Visa Direction Financière</div>
                            <div className="font-mono text-emerald-700 font-bold mt-1">CERTIFIÉ CONFORME</div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
