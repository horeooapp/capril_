"use client"

import React from "react"
import { Building2, Users, FileText, CheckCircle, Clock, AlertTriangle, Plus, Landmark } from "lucide-react"

export default function SyndicDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-qblue" size={32} /> Gestion Syndic
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Assemblées générales, appels de fonds et répartition des quotes-parts.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Nouvelle Résidence
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <Building2 className="text-qgrey-2 mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Résidences Gérées</p>
                        <p className="text-3xl font-black text-qnavy-dark">3</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <Users className="text-qblue mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Copropriétaires</p>
                        <p className="text-3xl font-black text-qnavy-dark">42</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm flex flex-col justify-between">
                    <FileText className="text-qorange mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Appels de Fonds</p>
                        <p className="text-3xl font-black text-qnavy-dark">12M <span className="text-sm">FCFA</span></p>
                    </div>
                </div>
                <div className="bg-qred-pale p-6 rounded-3xl border border-qred/20 shadow-sm flex flex-col justify-between">
                    <AlertTriangle className="text-qred mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-qred-dark uppercase tracking-widest mb-1">Arriérés Syndic</p>
                        <p className="text-3xl font-black text-qred">850K <span className="text-sm">FCFA</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Assemblées & Immeubles</h3>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Copropriété</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Lots</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Trésorerie Associée</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Dernière AG</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                            <td className="p-5 font-bold text-sm text-qnavy-dark">Résidence Les Perles, Cocody</td>
                            <td className="p-5 text-sm font-black text-qnavy">24 Lots</td>
                            <td className="p-5 text-sm font-black text-qgreen">4,550,000 FCFA</td>
                            <td className="p-5"><span className="bg-qgreen-pale text-qgreen px-2 py-1 rounded text-[10px] font-black uppercase">Validée (Mars 2026)</span></td>
                        </tr>
                        <tr className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                            <td className="p-5 font-bold text-sm text-qnavy-dark">Tour Ivoire, Plateau</td>
                            <td className="p-5 text-sm font-black text-qnavy">12 Lots</td>
                            <td className="p-5 text-sm font-black text-qgreen">12,200,000 FCFA</td>
                            <td className="p-5"><span className="bg-qorange-pale text-qorange px-2 py-1 rounded text-[10px] font-black uppercase">Prévue (Juillet 2026)</span></td>
                        </tr>
                        <tr className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                            <td className="p-5 font-bold text-sm text-qnavy-dark">Immeuble Saphir, Zone 4</td>
                            <td className="p-5 text-sm font-black text-qnavy">6 Lots</td>
                            <td className="p-5 text-sm font-black text-qred">- 450,000 FCFA</td>
                            <td className="p-5"><span className="bg-qred-pale text-qred px-2 py-1 rounded text-[10px] font-black uppercase">En Souffrance</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-lg overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-blue-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-400/30 inline-block mb-4">Moteur de Cantièmes</div>
                    <h2 className="text-2xl font-black mb-3">Répartition Automatique des Charges</h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">Le prochain déploiement V4.2 liera directement les millièmes d'un immeuble au générateur de quittances QAPRIL. Fini les facturations manuelles pour la réparation de l'ascenseur.</p>
                    <button className="bg-white text-qnavy px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
                        Configurer Tantièmes
                    </button>
                </div>
                <Building2 size={160} className="absolute right-0 opacity-10 -translate-y-4" />
            </div>
        </div>
    )
}
