"use client"

import React from "react"
import { FileSignature, ShieldCheck, Download, Plus, Clock, Key } from "lucide-react"

export default function ProcurationsDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <FileSignature className="text-purple-600" size={32} /> Procurations & Actes
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Délégations de signature notariées et mandats annexes pour les collaborateurs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Émettre Délégation
                    </button>
                </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#6b21a8_0%,#3b0764_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-purple-400/30">
                        <ShieldCheck size={12} className="text-purple-300"/> Validité Juridique
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">La traçabilité absolue des délégations de gestion.</h2>
                    <p className="text-purple-100 text-sm font-medium leading-relaxed mb-6">
                        Ce coffre-fort numérique lie automatiquement une procuration physique (téléversée) aux droits d'accès de l'utilisateur dans QAPRIL. Plus d'accès illicite.
                    </p>
                </div>
                <Key size={200} className="absolute right-0 opacity-10 rotate-12 -translate-y-6 pointer-events-none" />
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Référence Acte</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Délégataire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Périmètre</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Document</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors">
                            <td className="p-5 font-bold text-xs text-qnavy-dark">PROC-26-012</td>
                            <td className="p-5 font-bold text-sm text-purple-700">Me KONAN (Notaire)</td>
                            <td className="p-5 text-xs text-qtext-mid">Signature Baux Commerciaux</td>
                            <td className="p-5">
                                <span className="text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg">Active</span>
                            </td>
                            <td className="p-5 text-right">
                                <button className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-purple-600 transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto">
                                    <Download size={12}/> Copie PDF
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
