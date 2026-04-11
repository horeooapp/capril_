"use client"

import React, { useState } from "react"
import { Map, Navigation, MapPin, Search, Layers, Hexagon, Radar, Crosshair, MapPinned, ActivitySquare, AlertOctagon } from "lucide-react"
import { toast } from "sonner";

export default function GeoRadarDashboardPage() {
    const [properties] = useState([
        {
            id: "PROP-09X",
            name: "Immeuble Le Zénith",
            district: "Cocody Ambassades",
            lat: 5.3453,
            lng: -4.0123,
            status: "SAFE",
            rentability: "HAUTE",
            units: 24,
            warning: null
        },
        {
            id: "PROP-12Y",
            name: "Cour Commune Sicogi",
            district: "Yopougon Niangon",
            lat: 5.3190,
            lng: -4.0833,
            status: "CRITICAL",
            rentability: "FAIBLE",
            units: 8,
            warning: "Zone Rouge: 60% d'Impayés"
        },
        {
            id: "PROP-03Z",
            name: "Villa Duplex",
            district: "Marcory Zone 4",
            lat: 5.2931,
            lng: -3.9789,
            status: "SAFE",
            rentability: "MOYENNE",
            units: 1,
            warning: null
        }
    ])

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 bg-[#0B1120] min-h-[90vh] rounded-[3rem] shadow-inner text-slate-300">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Radar size={12} /> Cartographie Satellitaire Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Radar <span className="text-emerald-400">Géospatial</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        Analyse topographique des risques et suivi GPS du portefeuille (Abidjan).
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-slate-800 border text-slate-300 border-slate-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm flex items-center gap-2">
                        <Layers size={16} /> Filtres Heatmap
                    </button>
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-md flex items-center gap-2">
                        <Navigation size={16} /> Cadrer sur Abidjan
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                 {/* Map Area (Simulated UI) */}
                 <div className="flex-1 bg-[#0F172A] rounded-[2rem] border border-slate-800 overflow-hidden relative min-h-[500px] shadow-2xl flex items-center justify-center">
                    
                    {/* Fake Map Grid Background */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #0B1120 100%)'}}></div>
                    
                    {/* Simulated Radar Sweep */}
                    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/10 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                        <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/20 flex items-center justify-center">
                            <div className="w-[400px] h-[400px] rounded-full border border-emerald-500/30"></div>
                        </div>
                        {/* Sweeper arm */}
                        <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-400 origin-left" style={{ clipPath: 'polygon(0 0, 100% -5000%, 100% 5000%)' }}></div>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            <Crosshair size={14}/> GPS Actif
                        </div>
                    </div>

                    {/* Properties blips on map */}
                    <div className="absolute top-[35%] left-[60%] group">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
                        <div className="w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 relative z-10 flex items-center justify-center"><MapPinned size={10} className="text-slate-900 hidden group-hover:block"/></div>
                        <div className="hidden group-hover:block absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-3 rounded-xl w-48 shadow-xl z-20">
                            <p className="text-xs font-bold text-white">Immeuble Le Zénith</p>
                            <p className="text-[10px] text-slate-400 mt-1">Cocody Ambassades</p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-2">Rentabilité HAUTE</p>
                        </div>
                    </div>

                    <div className="absolute top-[60%] left-[30%] group">
                        <div className="w-6 h-6 bg-rose-500 rounded-full animate-ping absolute opacity-50"></div>
                        <div className="w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 relative z-10"></div>
                        <div className="hidden group-hover:block absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-rose-500/50 p-3 rounded-xl w-48 shadow-xl z-20">
                            <p className="text-xs font-bold text-white">Cour Commune Sicogi</p>
                            <p className="text-[10px] text-slate-400 mt-1">Yopougon Niangon</p>
                            <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><AlertOctagon size={10}/> ZONE ROUGE (60% Impayés)</p>
                        </div>
                    </div>

                     <div className="absolute top-[70%] left-[55%] group">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute opacity-30"></div>
                        <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-slate-900 relative z-10"></div>
                        <div className="hidden group-hover:block absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-3 rounded-xl w-48 shadow-xl z-20">
                            <p className="text-xs font-bold text-white">Villa Duplex</p>
                            <p className="text-[10px] text-slate-400 mt-1">Marcory Zone 4</p>
                        </div>
                    </div>

                 </div>

                 {/* Assets Register */}
                 <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-4">
                     <div className="flex items-center gap-2 px-2">
                        <ActivitySquare className="text-slate-500" size={16} />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Actifs Télémétriques</h3>
                     </div>

                     <div className="space-y-3">
                         {properties.map(p => (
                             <div key={p.id} className="bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-colors p-4 rounded-2xl flex flex-col gap-3 cursor-pointer group">
                                 <div className="flex justify-between items-start">
                                     <div>
                                        <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">{p.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{p.district}</p>
                                     </div>
                                     {p.status === 'SAFE' ? (
                                         <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[9px] font-black tracking-widest">OK</div>
                                     ) : (
                                         <div className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded text-[9px] font-black tracking-widest animate-pulse">RISK</div>
                                     )}
                                 </div>
                                 <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                     <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                        <MapPin size={10} className="text-slate-500"/>
                                        {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                                     </div>
                                     <div className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                                        {p.units} Lot(s)
                                     </div>
                                 </div>
                                 {p.warning && (
                                     <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                         {p.warning}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    )
}
