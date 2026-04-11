"use client"

import React from "react"
import { Landmark, FileSpreadsheet, Percent, Calculator, Activity, Download } from "lucide-react"

export default function FiscalDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-qblue" size={32} /> Liasses Fiscales
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Moteur fiscal générant automatiquement vos déclarations IFU, TVA, et TAF.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Download size={16} /> Exporter IFU Annuel
                </button>
            </div>

            <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-blue-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-blue-400/30">
                        <Activity size={12} className="text-blue-300"/> Conforme OHADA
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">Génération automatique des bordereaux d'impôt.</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
                        Chaque quittance générée sur QAPRIL ventile automatiquement la base imposable. En fin d'année, votre liasse IFU (Impôt Foncier Unicisé) est prête à être envoyée à la DGI en un clic.
                    </p>
                    <div className="flex gap-4">
                       <button className="bg-white text-qnavy px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                           <FileSpreadsheet size={16} /> Synthèse DGI
                       </button>
                    </div>
                </div>
                <Calculator size={200} className="absolute right-0 opacity-10 rotate-12 -translate-y-6 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm">
                     <div className="flex items-center justify-between mb-6 border-b border-qgrey-2 pb-4">
                         <h3 className="text-xl font-black text-qnavy-dark">Déclarations Périodiques</h3>
                         <Percent className="text-qorange" size={24} />
                     </div>
                     <div className="space-y-4">
                         <div className="flex justify-between items-center bg-qgrey-1/30 p-4 rounded-xl border border-qgrey-2">
                             <div>
                                 <p className="text-sm font-black text-qnavy">TVA (18%)</p>
                                 <p className="text-[10px] font-bold text-qtext-light uppercase mt-1">Immobilier Commercial</p>
                             </div>
                             <button className="bg-white text-qnavy font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm border border-qgrey-2 hover:bg-qnavy hover:text-white transition-colors">
                                 Éditer T3
                             </button>
                         </div>
                         <div className="flex justify-between items-center bg-qgrey-1/30 p-4 rounded-xl border border-qgrey-2">
                             <div>
                                 <p className="text-sm font-black text-qnavy">TAF (Taxe Actions Financières)</p>
                                 <p className="text-[10px] font-bold text-qtext-light uppercase mt-1">Paiements Mobile Money</p>
                             </div>
                             <span className="bg-qgreen-pale text-qgreen text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-qgreen/20">
                                 Prélevé à la source
                             </span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm">
                     <div className="flex items-center justify-between mb-6 border-b border-qgrey-2 pb-4">
                         <h3 className="text-xl font-black text-qnavy-dark">Déclarations Annuelles</h3>
                         <Landmark className="text-qblue" size={24} />
                     </div>
                     <div className="space-y-4">
                         <div className="flex flex-col items-center justify-center py-6 bg-qgrey-1/30 rounded-xl border border-dashed border-qgrey-2 text-center h-full min-h-[140px]">
                             <FileSpreadsheet className="text-qgrey-2 mb-2" size={32} />
                             <p className="text-sm font-bold text-qtext-mid max-w-[200px]">L'exercice fiscal 2026 est actuellement en cours.</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light mt-2">La liasse sera disponible en Janvier 2027.</p>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    )
}
