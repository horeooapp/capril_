"use client"

import React from "react"
import { Star, ShieldAlert, CheckCircle, Search, TrendingUp, AlertOctagon } from "lucide-react"

export default function TrustIndexDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Star className="text-yellow-500" size={32} /> Indice de Confiance (ICL)
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Le système de scoring du comportement des locataires, exclusif à QAPRIL.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ICL Présentation */}
                 <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                     <Star size={200} className="absolute -right-10 top-0 opacity-10" />
                     <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block mb-6 border border-white/20 shadow-sm">
                            Score Universel
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">La fierté de <br/>nos bons payeurs.</h2>
                        <p className="text-yellow-50 text-sm font-medium leading-relaxed max-w-md">
                            L'Indice de Confiance Locataire (ICL) évalue l'assiduité numérique (KYC), le paiement à date (Quittances) et l'entretien du bien (Maintenance tickets). Un locataire A+ est votre meilleur actif.
                        </p>
                     </div>
                 </div>

                 {/* Simulated Chart/Stats */}
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm flex flex-col justify-center">
                     <h3 className="text-xs font-black text-qtext-light uppercase tracking-widest mb-6 border-b border-qgrey-2 pb-4">Répartition de votre parc</h3>
                     
                     <div className="space-y-5">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 font-black text-xl flex items-center justify-center border border-green-100 shadow-sm">
                                 A+
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-qnavy">Excellents Payeurs</span>
                                    <span className="text-qtext-light">65%</span>
                                 </div>
                                 <div className="w-full bg-qgrey-2 rounded-full h-2">
                                     <div className="bg-qgreen h-2 rounded-full" style={{width: '65%'}}></div>
                                 </div>
                             </div>
                         </div>

                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center border border-blue-100 shadow-sm">
                                 B
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-qnavy">Retards Occasionnels</span>
                                    <span className="text-qtext-light">25%</span>
                                 </div>
                                 <div className="w-full bg-qgrey-2 rounded-full h-2">
                                     <div className="bg-qblue h-2 rounded-full" style={{width: '25%'}}></div>
                                 </div>
                             </div>
                         </div>

                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 font-black text-xl flex items-center justify-center border border-orange-100 shadow-sm">
                                 C
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-qnavy">Profils à Risque</span>
                                    <span className="text-qtext-light">10%</span>
                                 </div>
                                 <div className="w-full bg-qgrey-2 rounded-full h-2">
                                     <div className="bg-qorange h-2 rounded-full" style={{width: '10%'}}></div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Simulated Query Registry */}
            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center justify-between bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Requêtes & Vérifications</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Entrez un ICL ID..." className="w-64 pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all" />
                    </div>
                </div>
                <div className="p-10 text-center">
                    <ShieldAlert className="text-qgrey-2 mx-auto mb-3" size={40} />
                    <h3 className="text-xl font-black text-qnavy-dark mb-2">Moteur ICL Bloqué</h3>
                    <p className="text-sm font-bold text-qtext-light max-w-lg mx-auto">
                        Afin de protéger la vie privée selon les standards de conformité de l'OIF, l'export des identifiants nominatifs sera disponible lorsque votre compte agence aura validé l'accréditation ICL.
                    </p>
                    <button className="mt-6 bg-qnavy text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-sm">
                        Demander Accréditation ICL
                    </button>
                </div>
            </div>
        </div>
    )
}
