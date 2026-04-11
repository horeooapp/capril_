"use client"

import React, { useState } from "react"
import { Scale, AlertTriangle, ShieldCheck, FileCheck, Search, FileSignature, UploadCloud, ChevronRight, Gavel, FileLock2, Info } from "lucide-react"

export default function CertifieDisputesPage() {
    const [litiges] = useState([
        {
            id: "LIT-248-CI",
            locataire: "SYLLA Ousmane",
            bien: "Bureau 12 - Plateau",
            type: "IMPAYE_GRAVE",
            statut: "EN_ATTENTE_TRIBUNAL",
            hashCaci: "a9x2...1b4",
            dateEscalade: "12 Avril 2026",
            gravite: "EVICTION_ORDER"
        },
        {
            id: "LIT-235-CI",
            locataire: "MOUKETO Christian",
            bien: "Villa 32 - Angré 9ème",
            type: "DEGRADATION_LOURDE",
            statut: "DOSSIER_CONSTITUE",
            hashCaci: "En préparation",
            dateEscalade: "10 Avril 2026",
            gravite: "DEMANDE_ARBITRAGE"
        }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-red-600 to-rose-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Scale size={12} /> Procédures Judiciaires & CACI
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                        <Gavel className="text-red-600" size={32} /> Triage Judiciaire
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Génération des Dossiers Litiges Certifiés (DLC) opposables devant les tribunaux ivoiriens.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Scale size={16} /> Médiations (Amiable)
                    </button>
                    <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-md flex items-center gap-2">
                        <FileSignature size={16} /> Ouvrir un Dossier (DLC)
                    </button>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex gap-4">
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                     <h3 className="font-bold text-sm text-red-800 uppercase tracking-widest">Avertissement Légal</h3>
                     <p className="text-xs font-medium text-red-700 mt-1">
                        La classification en "Litige Certifié" ancre la preuve de l'historique logiciel (retards de loyers tracés, edl signé, injonctions de payer sans réponse) dans un hash SHA-256 inaltérable. Toute réquisition de la force publique doit se baser sur l'UUID de ce dossier.
                     </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <Gavel className="text-red-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Dossiers Certifiés</p>
                        <p className="text-2xl font-black text-qnavy-dark">02 <span className="text-sm font-bold text-qtext-mid">dossiers</span></p>
                    </div>
                </div>
                <div className="bg-[linear-gradient(135deg,#7F1D1D_0%,#450A0A_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <Scale className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-white/10">
                        <FileLock2 className="text-white" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1 shadow-sm">Ordres d'Expulsion (CACI)</p>
                        <p className="text-2xl font-black text-white">01 <span className="text-sm opacity-80">En Triage</span></p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        <FileCheck size={18} className="text-red-600"/> Registre des Poursuites Actives
                    </h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="UUID, Nom..." className="w-full pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Référence (UUID)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Contrevenant</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Motif Judiciaire</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Code Preuve (SHA)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right">Sanction Visée</th>
                            </tr>
                        </thead>
                        <tbody>
                            {litiges.map((l) => (
                                <tr key={l.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-xs text-qnavy">{l.id}</p>
                                        <p className="text-[9px] font-black uppercase text-qtext-mid mt-0.5">{l.dateEscalade}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy-dark">{l.locataire}</p>
                                        <p className="text-[10px] font-bold text-qtext-mid mt-0.5">{l.bien}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100">
                                            {l.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                         {l.hashCaci.includes('préparation') ? (
                                            <span className="text-xs font-medium text-qtext-light italic">{l.hashCaci}</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-red-600" />
                                                <code className="bg-qgrey-1 px-2 py-1 rounded text-[10px] text-qnavy font-mono font-bold tracking-wider">{l.hashCaci}</code>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right flex justify-end">
                                        {l.gravite === 'EVICTION_ORDER' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                                                Ordre d'Expulsion
                                            </span>
                                        )}
                                        {l.gravite === 'DEMANDE_ARBITRAGE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-qgrey-2 text-qnavy text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                Arbitrage CACI
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
