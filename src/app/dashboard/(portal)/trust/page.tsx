"use client"

import React, { useState } from "react"
import { ShieldAlert, Lock, CheckCircle2, ArrowRightLeft, FileCheck, CircleDollarSign, Fingerprint, Banknote } from "lucide-react"

export default function TrustVaultDashboardPage() {
    const [cautions] = useState([
        {
            id: "CAU-2026-904",
            locataire: "KOUAME Jean",
            bien: "Appart 04 - Rés. Olympe",
            montant: 300000,
            statut: "CONSIGNEE",
            hash: "a3f9c21...8b4",
            dateConsignation: "10 Avr 2026"
        },
        {
            id: "CAU-2026-905",
            locataire: "TOURE Aminata",
            bien: "Studio A - Cour SICOGI",
            montant: 120000,
            statut: "A_TRANSFERER",
            hash: "En attente...",
            dateConsignation: "-"
        },
        {
            id: "CAU-2026-901",
            locataire: "DIABATE Oumar",
            bien: "Villa 12 - Riviéra Palmeraie",
            montant: 1200000,
            statut: "RESTITUEE",
            hash: "f7d1a22...3c1",
            dateConsignation: "15 Fév 2025"
        }
    ])

    const totalConsigne = cautions.filter(c => c.statut === "CONSIGNEE").reduce((acc, c) => acc + c.montant, 0)
    const totalRisque = cautions.filter(c => c.statut === "A_TRANSFERER").reduce((acc, c) => acc + c.montant, 0)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ShieldAlert size={12} /> Conformité Légale (Loi n°2019-576)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                         Coffre-Fort CDC-CI
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Consignation étatique des dépôts de garantie (Cautions) à la Caisse des Dépôts et Consignations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-amber-100/50 border border-amber-200 text-amber-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm flex items-center gap-2">
                        <FileCheck size={16} /> Audit Conformité
                    </button>
                    <button className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all shadow-md flex items-center gap-2">
                        Transférer au Trésor <ArrowRightLeft size={16} />
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-[linear-gradient(135deg,#B45309_0%,#78350F_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <Lock className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-amber-500/30">
                        <CircleDollarSign className="text-amber-300" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1 shadow-sm">Bloqué à la CDC-CI (Sécurisé)</p>
                        <p className="text-3xl font-black text-white">{totalConsigne.toLocaleString()} <span className="text-sm opacity-80">FCFA</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border-2 border-red-100 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <ShieldAlert className="text-red-500" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Cautions en Risque Judiciaire</p>
                        <p className="text-3xl font-black text-qnavy-dark">{totalRisque.toLocaleString()} <span className="text-sm text-qtext-mid">FCFA</span></p>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qgreen-pale p-4 rounded-2xl border border-qgreen/20">
                        <ArrowRightLeft className="text-qgreen" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Cautions Restituées (Fin de Bail)</p>
                        <p className="text-3xl font-black text-qnavy-dark">1,200,000 <span className="text-sm text-qtext-mid">FCFA</span></p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm text-amber-800 font-medium">
                    <strong className="font-black uppercase tracking-widest text-amber-900 border-b border-amber-200 border-dashed pb-0.5">Note Légale :</strong> Conformément à la législation ivoirienne, le dépôt de garantie ne doit plus être conservé par le bailleur ni l'agence. Une fois encaissé via QAPRIL, il doit être conféré au compte séquestre CDC-CI de l'État sous 48h.
                </p>
            </div>

            {/* Cautions Table */}
             <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        <Lock size={18} className="text-amber-600"/> Registre des Consignations
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Contrat (Bail)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Locataire</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Valeur Caut.</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Code Hachage (CDC)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right">Statut Légal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cautions.map((c, i) => (
                                <tr key={c.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-xs text-qnavy">{c.bien}</p>
                                        <p className="text-[10px] font-black uppercase text-qtext-mid mt-0.5">{c.id}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-qgrey-2 flex items-center justify-center font-bold text-[10px] text-qnavy">
                                                {c.locataire.charAt(0)}
                                            </div>
                                            <span className="font-bold text-sm text-qnavy-dark">{c.locataire}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-black text-sm text-qnavy-dark">
                                        {c.montant.toLocaleString()} <span className="text-[10px] text-qtext-light opacity-60">FCFA</span>
                                    </td>
                                    <td className="p-5">
                                        {c.hash.includes('attente') ? (
                                            <span className="text-xs font-medium text-qtext-light italic">{c.hash}</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Fingerprint size={14} className="text-amber-600" />
                                                <code className="bg-qgrey-1 px-2 py-1 rounded text-[10px] text-qnavy font-mono font-bold tracking-wider">{c.hash}</code>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        {c.statut === 'CONSIGNEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                                <Lock size={10} /> Consignée ({c.dateConsignation})
                                            </span>
                                        )}
                                        {c.statut === 'A_TRANSFERER' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-100 shadow-sm animate-pulse">
                                                <ShieldAlert size={10} /> Transfert Requis !
                                            </span>
                                        )}
                                        {c.statut === 'RESTITUEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-qgreen-pale text-qgreen text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                <CheckCircle2 size={10} /> Restituée
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
