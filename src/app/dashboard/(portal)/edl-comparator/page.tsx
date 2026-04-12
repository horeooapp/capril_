"use client"

import React from "react"
import { Image as ImageIcon, Camera, ScanLine, AlertTriangle, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner";

export default function EDLComparatorPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <ScanLine className="text-purple-500" size={32} /> EDL Comparator <span className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded ml-2">IA BETA</span>
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Algorithme Vision pour analyser l'usure entre l'entrée et la sortie du locataire.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-qgrey-2 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-qnavy text-white p-4 rounded-full shadow-2xl border-4 border-white hidden md:block">
                    <ArrowRightLeft size={32} />
                </div>
                
                {/* IN */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-qgrey-1 px-4 py-2 rounded-xl">
                        <span className="text-xs font-black uppercase tracking-widest text-qtext-light">EDL Entrée (2024)</span>
                        <ImageIcon className="text-qtext-light" size={16}/>
                    </div>
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Room Before" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white mb-2" size={32}/>
                            <p className="text-white text-xs font-black uppercase tracking-widest">Voir Original</p>
                        </div>
                    </div>
                </div>

                {/* OUT */}
                <div className="space-y-4">
                     <div className="flex justify-between items-center bg-purple-50 px-4 py-2 rounded-xl">
                        <span className="text-xs font-black uppercase tracking-widest text-purple-700">EDL Sortie (2026)</span>
                        <ScanLine className="text-purple-600" size={16}/>
                    </div>
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Room After" className="w-full h-full object-cover grayscale" />
                        <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl shadow-lg animate-pulse flex items-center gap-2">
                             <AlertTriangle size={16} />
                             <span className="text-[10px] font-black uppercase">Anomalie: Mur écorché</span>
                        </div>
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-red-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={() => toast.success('Analyse comparative complétée. Rapport ajouté au dossier Locataire.')} className="bg-[linear-gradient(135deg,#6b21a8_0%,#3b0764_100%)] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-500/20">
                    Déduire du Dépôt de Garantie
                </button>
            </div>
        </div>
    )
}
