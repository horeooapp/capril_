"use client"

import React from "react"
import { LineChart, MapPin, TrendingUp, TrendingDown, Eye, Activity, Map } from "lucide-react"

export default function ObservatoryDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <LineChart className="text-blue-500" size={32} /> Observatoire (IA)
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Plateforme nationale d'analyse des tendances immobilières par zone courante.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-qnavy border border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Map size={16} /> Mode Carte
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                        Extraire Rapport Zone
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Simulateur de Zones */}
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100">
                             Zone Premium
                        </div>
                        <TrendingUp size={20} className="text-qgreen" />
                     </div>
                     <h3 className="text-xl font-black text-qnavy-dark mb-1">Cocody Ambassades</h3>
                     <p className="text-xs font-bold text-qtext-mid mb-6 flex items-center gap-1"><MapPin size={12}/> Abidjan Nord</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Loyer Moyen (Villa)</span>
                             <span className="font-black text-sm text-qnavy">2.5M FCFA</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Tension Locative</span>
                             <span className="font-black text-sm text-qred">Très Forte (98%)</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Évo. sur 1 an</span>
                             <span className="font-black text-sm text-qgreen">+ 12.4%</span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-100">
                             Zone Intermédiaire
                        </div>
                        <TrendingUp size={20} className="text-qgreen" />
                     </div>
                     <h3 className="text-xl font-black text-qnavy-dark mb-1">Marcory Zone 4</h3>
                     <p className="text-xs font-bold text-qtext-mid mb-6 flex items-center gap-1"><MapPin size={12}/> Abidjan Sud</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Loyer Moyen (Appart)</span>
                             <span className="font-black text-sm text-qnavy">850K FCFA</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Tension Locative</span>
                             <span className="font-black text-sm text-orange-500">Moyenne (60%)</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-qtext-light uppercase">Évo. sur 1 an</span>
                             <span className="font-black text-sm text-qgreen">+ 5.1%</span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] border border-qnavy rounded-[2rem] p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                     <Activity className="absolute -right-10 -top-10 text-white opacity-5" size={150} />
                     <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-300 mb-2">QAPRIL Core Engine</h3>
                        <p className="text-sm text-gray-300 font-medium leading-relaxed">Croisez vos propres loyers de mandat avec l'évolution nationale pour ajuster vos grilles tarifaires automatiquement à l'échéance des baux.</p>
                     </div>
                     <button className="w-full bg-white text-qnavy font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-gray-100 mt-6 shadow-md transition-all">
                         Démarrer l'Analyse IA
                     </button>
                 </div>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-qgrey-2 p-8 text-center shadow-sm">
                <Eye size={40} className="text-qgrey-2 mx-auto mb-4" />
                <h3 className="text-xl font-black text-qnavy-dark mb-2">Cartographie Nationale Bientôt Disponible</h3>
                <p className="text-sm font-bold text-qtext-light max-w-lg mx-auto">La vue carte 3D alimentée par nos partenaires OpenStreetMap et les données de l'association nationale des agents sera activée au T4.</p>
            </div>
        </div>
    )
}
