"use client"

import React from "react"
import { Image as ImageIcon, Camera, ScanLine, AlertTriangle, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner";

export default function EDLComparatorPage() {
    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <ScanLine className="text-purple-600" size={32} /> EDL Comparator <span className="bg-purple-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-[6px] ml-2 shadow-sm">IA BETA</span>
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Algorithme Vision pour analyser l'usure entre l'entrée et la sortie du locataire.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 text-white p-4 rounded-full shadow-lg border-[6px] border-white hidden md:block">
                    <ArrowRightLeft size={24} />
                </div>
                
                {/* IN */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-[12px]">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">EDL Entrée (2024)</span>
                        <ImageIcon className="text-slate-400" size={16}/>
                    </div>
                    <div className="w-full aspect-video bg-slate-100 rounded-[16px] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Room Before" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <Camera className="text-white mb-2" size={32}/>
                            <p className="text-white text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-[8px]">Voir Original</p>
                        </div>
                    </div>
                </div>

                {/* OUT */}
                <div className="space-y-4">
                     <div className="flex justify-between items-center bg-purple-50 border border-purple-100 px-4 py-3 rounded-[12px]">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-700">EDL Sortie (2026)</span>
                        <ScanLine className="text-purple-600" size={16}/>
                    </div>
                    <div className="w-full aspect-video bg-slate-100 rounded-[16px] flex items-center justify-center relative overflow-hidden group border border-slate-200">
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Room After" className="w-full h-full object-cover grayscale" />
                        <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-2 rounded-[10px] shadow-lg animate-pulse flex items-center gap-2 border border-rose-400">
                             <AlertTriangle size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Anomalie: Mur écorché</span>
                        </div>
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r=>setTimeout(r, 800)), {loading: "Traitement...", success: "Analyse comparative complétée. Rapport ajouté au dossier Locataire."}); }} className="bg-slate-900 text-white px-8 py-4 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2 border border-slate-700">
                    Déduire du Dépôt de Garantie
                </button>
            </div>
        </div>
    )
}
