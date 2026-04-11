"use client"

import React, { useState } from "react"
import { Users, FileText, ArrowRight, ShieldCheck, Search, FileSignature, BookCopy, Info, Clock, CheckCircle } from "lucide-react"

export default function SuccessionDashboardPage() {
    const [successions] = useState([
        {
            id: "SUC-2026-001",
            type: "LOCATAIRE",
            defunt: "M. N'DRI Konan",
            successeur: "Mme N'DRI Affoué",
            relation: "EPOUSE",
            bien: "Appartement 14 - Riviera 3",
            dateDeces: "15 Avril 2026",
            statut: "EN_ATTENTE_ACTE",
            actesValidés: false
        },
        {
            id: "SUC-2026-002",
            type: "PROPRIETAIRE",
            defunt: "Veuve DIALLO",
            successeur: "Amadou DIALLO (Mandataire)",
            relation: "FILS",
            bien: "Immeuble Les Lilas (12 baux)",
            dateDeces: "02 Mars 2026",
            statut: "TRANSFERT_VALIDE",
            actesValidés: true
        }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <BookCopy size={12} /> Procédures Exceptionnelles
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Users className="text-slate-400" size={32} /> Transferts & Successions
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                        Gestion post-mortem des contrats. Transfert légal des droits, cautions et obligations d'un bail consécutivement au décès d'une partie (Art. 418 CCH).
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md flex items-center gap-2">
                        <FileSignature size={16} /> Initier une Succession
                    </button>
                </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-slate-50 border-l-4 border-slate-300 p-5 rounded-r-2xl flex gap-4">
                <Info className="text-slate-500 shrink-0 mt-0.5" size={20} />
                <div>
                     <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        Le décès du locataire ou du bailleur <strong>ne met pas fin de plein droit au contrat de bail</strong>. En cas de décès du locataire, le bail est transféré au conjoint survivant, ou aux descendants/ascendants qui vivaient avec lui depuis au moins 6 mois. Les certificats de décès et d'hérédité doivent être sourcés obligatoirement.
                     </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
                         Dossiers de Succession en cours
                    </h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Rechercher défunt ou successeur..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-400">Réf & Type</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-400">Défunt & Date</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-400">Ayang Droit (Successeur)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-400">Actes Légaux</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-400 text-right">Statut Moteur</th>
                            </tr>
                        </thead>
                        <tbody>
                            {successions.map((s) => (
                                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-xs text-slate-800">{s.id}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${s.type === 'LOCATAIRE' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            Décès {s.type}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                                 {s.defunt} 
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">{s.dateDeces}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <span className="font-bold text-sm text-slate-700">{s.successeur}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 ml-5">
                                                Qualité: {s.relation}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {s.actesValidés ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <ShieldCheck size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Vérifiés</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-500">
                                                <FileText size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">En Attente</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        {s.statut === 'EN_ATTENTE_ACTE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-slate-200">
                                                <Clock size={12} /> Suspendu
                                            </span>
                                        )}
                                        {s.statut === 'TRANSFERT_VALIDE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                                                <CheckCircle size={12} /> Transfert Effectué
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
