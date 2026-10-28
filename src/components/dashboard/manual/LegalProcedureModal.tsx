"use client"

import React, { useState } from "react"
import { X, Scale, Copy, Check, Printer, ShieldCheck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export interface LegalProcedureItem {
    id: string
    title: string
    lawReference: string
    summary: string
    keyArticles: {
        articleNumber: string
        text: string
    }[]
    practicalRule: string
    penalties?: string
}

interface LegalProcedureModalProps {
    procedure: LegalProcedureItem | null
    onClose: () => void
}

export default function LegalProcedureModal({ procedure, onClose }: LegalProcedureModalProps) {
    const [copied, setCopied] = useState(false)

    if (!procedure) return null

    const handleCopy = () => {
        const textToCopy = `${procedure.title}\nRéférence : ${procedure.lawReference}\n\n${procedure.summary}\n\nArticles Clés :\n${procedure.keyArticles.map(a => `${a.articleNumber} : ${a.text}`).join("\n\n")}\n\nRègle Pratique : ${procedure.practicalRule}`
        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        toast.success("Texte légal copié dans le presse-papiers.")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="space-y-2 pb-5 border-b border-slate-100 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        <Scale size={12} /> {procedure.lawReference}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {procedure.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                        {procedure.summary}
                    </p>
                </div>

                {/* Legal Content */}
                <div className="py-6 space-y-6">
                    {/* Key Articles */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Articles de Référence
                        </h4>
                        <div className="space-y-3">
                            {procedure.keyArticles.map((article, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">
                                        {article.articleNumber}
                                    </span>
                                    <p className="text-xs font-serif text-slate-700 italic leading-relaxed">
                                        « {article.text} »
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Practical Rule in QAPRIL */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div>
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                                Application stricte dans QAPRIL
                            </span>
                            <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                                {procedure.practicalRule}
                            </p>
                        </div>
                    </div>

                    {/* Penalties note if any */}
                    {procedure.penalties && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                            <div>
                                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                                    Sanctions légales encourues
                                </span>
                                <p className="text-xs font-medium text-rose-800 leading-relaxed">
                                    {procedure.penalties}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                        onClick={handleCopy}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                    >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {copied ? "Copié !" : "Copier le texte légal"}
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                        <Printer size={14} /> Imprimer cette fiche
                    </button>
                </div>
            </div>
        </div>
    )
}
