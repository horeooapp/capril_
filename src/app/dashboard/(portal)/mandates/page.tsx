"use client"

import React, { useState } from "react"
import { ClipboardList, Search, FileSignature, CheckCircle, ShieldAlert, ArrowRight, UserCheck } from "lucide-react"

export default function MandatesDashboardPage() {
    const [mandates] = useState<any[]>([
        { id: "MAND-26-001", property: "Résidence Le Saphir", type: "GESTION", fee: "10%", status: "ACTIF", endDate: "2027-01-01" },
        { id: "MAND-26-042", property: "Villa Triplex", type: "RECHERCHE_LOCATAIRE", fee: "1 Mois", status: "CLOTURE", endDate: "2026-04-10" }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <UserCheck className="text-qorange" size={32} /> Mandats de Gestion
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Vos contrats de gérance avec les propriétaires et honoraires associés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        <FileSignature size={16} /> Éditer un Mandat
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Mandats Actifs</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">1</p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Taux Moyen (Gestion)</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">10.0%</p>
                 </div>
                 <div className="bg-qorange-pale border border-qorange/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qorange-dark">Expirants (30j)</p>
                     <p className="text-3xl font-black text-qorange mt-1">0</p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center justify-between bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Registre</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Rechercher..." className="w-64 pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-qorange focus:ring-1 focus:ring-qorange transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Mandat ID</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Bien Immobilier</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Type & Honoraire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Échéance</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Contrat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mandates.map(m => (
                            <tr key={m.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer">
                                <td className="p-5">
                                    <span className="font-bold text-xs text-qnavy-dark">{m.id}</span>
                                    {m.status === 'ACTIF' ? (
                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-qgreen mt-1">
                                            <CheckCircle size={10}/> Actif
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                            <ShieldAlert size={10}/> Clos
                                        </div>
                                    )}
                                </td>
                                <td className="p-5 font-bold text-sm text-qnavy">{m.property}</td>
                                <td className="p-5">
                                    <span className="bg-qgrey-1 text-qtext-mid px-2 py-1 rounded text-[9px] font-black uppercase block w-max mb-1">{m.type}</span>
                                    <span className="text-xs font-black text-qnavy-dark">{m.fee}</span>
                                </td>
                                <td className="p-5 text-sm font-bold text-qtext-mid">{m.endDate}</td>
                                <td className="p-5 text-right">
                                    <button className="w-8 h-8 rounded-full bg-white border border-qgrey-2 flex items-center justify-center text-qnavy hover:bg-qnavy hover:text-white transition-colors ml-auto shadow-sm">
                                        <ArrowRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
