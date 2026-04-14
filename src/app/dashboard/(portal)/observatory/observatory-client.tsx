"use client"

import React, { useTransition } from "react"
import { Map, Navigation, MapPin, Search, Layers, Crosshair, MapPinned, ActivitySquare, AlertOctagon } from "lucide-react"
import { toast } from "sonner";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function GeoRadarDashboardClient({ properties }: { properties: any[] }) {
    
    // Fake sweep animation
    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-3 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <MapPinned size={12} /> Cartographie Satellitaire Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-1">
                        Radar Géospatial
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Analyse topographique des actifs connectés à votre réseau en temps réel.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.promise(new Promise(r=>setTimeout(r,1000)), {loading:'Analyse des filtres cartographiques...', success:'Heatmap rafraîchie.'})} className="bg-white border text-slate-700 border-slate-200 px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Layers size={16} /> Filtres Heatmap
                    </button>
                    <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-indigo-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                        <Navigation size={16} /> Cadrer sur Abidjan
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                 {/* Map Area (Simulated UI) */}
                 <div className="flex-1 bg-white rounded-[24px] border border-slate-200 overflow-hidden relative min-h-[500px] shadow-sm flex items-center justify-center">
                    
                    {/* Fake Map Grid Background (Light Mode) */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #f8fafc 100%)'}}></div>
                    
                    {/* Simulated Radar Sweep */}
                    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/10 animate-[spin_10s_linear_infinite] flex items-center justify-center pointer-events-none">
                        <div className="w-[600px] h-[600px] rounded-full border border-indigo-500/10 flex items-center justify-center">
                            <div className="w-[400px] h-[400px] rounded-full border border-indigo-500/20"></div>
                        </div>
                        {/* Sweeper arm */}
                        <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-400 origin-left" style={{ clipPath: 'polygon(0 0, 100% -5000%, 100% 5000%)' }}></div>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm">
                            <Crosshair size={14}/> GPS Actif
                        </div>
                    </div>

                    {/* Properties blips on map */}
                    {properties.map((p, i) => {
                        // Spread them visually since this is a CSS map simulation
                        const tX = 30 + (i * 15 % 50);
                        const tY = 30 + (i * 20 % 50);
                        return (
                            <div key={p.id} className="absolute group" style={{ top: `${tY}%`, left: `${tX}%`}}>
                                <div className={`w-4 h-4 rounded-full animate-ping absolute ${p.status === 'SAFE' ? 'bg-indigo-500 opacity-40' : 'bg-rose-500 opacity-50'}`}></div>
                                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md relative z-10 flex items-center justify-center ${p.status === 'SAFE' ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                                    {p.status === 'SAFE' && <MapPinned size={10} className="text-white hidden group-hover:block"/>}
                                </div>
                                <div className="hidden group-hover:block absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-3 rounded-[12px] w-48 shadow-xl z-20">
                                    <p className="text-[13px] font-bold text-slate-900 truncate">{p.name}</p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{p.district}</p>
                                    {p.status !== 'SAFE' && (
                                        <p className="text-[10.5px] text-rose-600 font-bold mt-2 flex items-center gap-1.5 bg-rose-50 py-1 px-2 rounded-md"><AlertOctagon size={12}/> {p.warning}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                 </div>

                 {/* Assets Register */}
                 <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-4">
                     <div className="flex items-center gap-2 px-2">
                        <ActivitySquare className="text-indigo-500" size={18} />
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actifs Télémétriques ({properties.length})</h3>
                     </div>

                     <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                         {properties.length === 0 && (
                            <div className="text-center text-slate-500 text-[13px] font-medium mt-10 p-10 border border-dashed border-slate-200 rounded-[16px] bg-slate-50">Aucun bien à tracker.</div>
                         )}
                         {properties.map(p => (
                             <div key={p.id} className="bg-white border border-slate-200 hover:border-slate-300 transition-colors p-4 rounded-[16px] shadow-sm flex flex-col gap-3 cursor-pointer group">
                                 <div className="flex justify-between items-start">
                                     <div className="max-w-[70%]">
                                        <p className="font-bold text-[13.5px] text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{p.name}</p>
                                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{p.district}</p>
                                     </div>
                                     {p.status === 'SAFE' ? (
                                         <Badge color="emerald">OK</Badge>
                                     ) : (
                                         <Badge color="rose">RISK</Badge>
                                     )}
                                 </div>
                                 <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                     <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-slate-500">
                                        <MapPin size={12} className="text-slate-400"/>
                                        {p.lat?.toFixed(4)}, {p.lng?.toFixed(4)}
                                     </div>
                                     <div className="text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">
                                        Rentabilité {p.rentability}
                                     </div>
                                 </div>
                                 {p.warning && (
                                     <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-[8px] border border-rose-100 mt-1">
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
