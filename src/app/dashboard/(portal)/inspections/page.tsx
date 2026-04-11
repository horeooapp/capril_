"use client"

import React from "react"
import { Search, MapPin, CheckSquare, Plus, FileSignature } from "lucide-react"

export default function InspectionsDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <CheckSquare className="text-qgreen" size={32} /> États des Lieux
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Répertoire central des inspections entrantes et sortantes.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Planifier Inspection
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Rechercher par adresse ou locataire..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qgreen focus:ring-1 focus:ring-qgreen transition-all" />
                    </div>
                </div>

                <div className="p-10 space-y-4">
                     <div className="bg-white border border-qgrey-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-qgreen-pale text-qgreen rounded-xl flex items-center justify-center font-black text-xl">
                                IN
                             </div>
                             <div>
                                 <h3 className="text-lg font-black text-qnavy-dark">Villa Riviera 3 - Entrée</h3>
                                 <p className="text-xs font-bold text-qtext-mid mt-1 flex items-center gap-1"><MapPin size={12}/> Locataire: AMANI Jean</p>
                                 <p className="text-[10px] text-qtext-light font-bold mt-1 uppercase tracking-widest">Signé le 02 Mars 2026</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-8">
                             <div className="text-center">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Photos</p>
                                 <p className="text-lg font-black text-qnavy">42</p>
                             </div>
                             <div className="text-center">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Usure Constatée</p>
                                 <p className="text-lg font-black text-qgreen">0%</p>
                             </div>
                             <button className="bg-transparent border border-qgrey-2 text-qnavy font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-qgrey-1 transition-colors">
                                 Voir Document
                             </button>
                         </div>
                     </div>

                     <div className="bg-white border border-qgreen border-dashed rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group">
                         <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-qgrey-1 text-qtext-mid rounded-xl flex items-center justify-center font-black text-xl">
                                OUT
                             </div>
                             <div>
                                 <h3 className="text-lg font-black text-qnavy-dark">Studio Palmeraie - Sortie Prévue</h3>
                                 <p className="text-xs font-bold text-qtext-mid mt-1 flex items-center gap-1"><MapPin size={12}/> Locataire: YAO Konan</p>
                                 <p className="text-[10px] text-qtext-light font-bold mt-1 uppercase tracking-widest">Prévu pour le 15 Mai 2026</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-8">
                             <button className="bg-qgreen text-white font-black text-xs uppercase px-6 py-3 rounded-xl hover:bg-qgreen-dark transition-colors shadow-sm flex items-center gap-2">
                                <FileSignature size={14}/> Démarrer Comparatif
                             </button>
                         </div>
                     </div>
                </div>
            </div>
            
            <div className="flex justify-center p-4">
               <p className="text-xs font-bold text-qtext-mid bg-qgrey-1 px-4 py-2 rounded-full">
                 L'outil "Comparateur d'Usure IA" est interconnecté avec la base photographique de QAPRIL Storage.
               </p>
            </div>
        </div>
    )
}
