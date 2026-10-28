"use client"

import React from "react"
import Link from "next/link"
import { X, CheckCircle2, ArrowRight, PlayCircle, ExternalLink, Lightbulb } from "lucide-react"

export interface TutorialItem {
    id: string
    title: string
    subtitle: string
    category: string
    duration: string
    badgeColor: "sky" | "emerald" | "amber" | "indigo" | "purple"
    steps: {
        stepNumber: number
        title: string
        description: string
        tip?: string
    }[]
    actionUrl?: string
    actionLabel?: string
}

interface TutorialModalProps {
    tutorial: TutorialItem | null
    onClose: () => void
}

export default function TutorialModal({ tutorial, onClose }: TutorialModalProps) {
    if (!tutorial) return null

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
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        <PlayCircle size={12} /> {tutorial.category} • Durée {tutorial.duration}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {tutorial.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                        {tutorial.subtitle}
                    </p>
                </div>

                {/* Step by Step Guide */}
                <div className="py-6 space-y-5">
                    {tutorial.steps.map((step) => (
                        <div key={step.stepNumber} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {step.stepNumber}
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                                {step.tip && (
                                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 font-medium mt-2">
                                        <Lightbulb size={13} className="shrink-0 text-amber-600 mt-0.5" />
                                        <span>{step.tip}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                    >
                        Fermer le guide
                    </button>

                    {tutorial.actionUrl && (
                        <Link
                            href={tutorial.actionUrl}
                            onClick={onClose}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                            <span>{tutorial.actionLabel || "Appliquer maintenant"}</span>
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
