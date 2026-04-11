"use client"

import React from "react"
import { Users, FileKey, Shield, AlertCircle, Plus, FileSignature, Landmark } from "lucide-react"

export default function SuccessionDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-purple-600" size={32} /> Successions & Indivision
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Démembrement de propriété et gestion des mandats héritiers.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Déclarer Indivision
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Card 1 */}
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-purple-100">
                             Démembrement
                        </div>
                        <Landmark size={20} className="text-qgrey-2" />
                     </div>
                     <h3 className="text-xl font-black text-qnavy-dark mb-1">Villa Assini</h3>
                     <p className="text-xs font-bold text-qtext-mid mb-6 flex items-center gap-1">Succession Famille KOUA</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                             <div className="flex items-center gap-2">
                                 <FileKey size={14} className="text-qorange"/>
                                 <span className="text-[10px] font-bold text-qnavy uppercase uppercase">Usufruitier (Perçoit Loyers)</span>
                             </div>
                             <span className="font-black text-sm text-qnavy">Mme Vve KOUA (100%)</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                 <Shield size={14} className="text-gray-400"/>
                                 <span className="text-[10px] font-bold text-qtext-light uppercase uppercase">Nus-Propriétaires</span>
                             </div>
                             <span className="font-black text-sm text-qtext-mid">4 Enfants</span>
                         </div>
                     </div>
                 </div>

                 {/* Card 2 */}
                 <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-100">
                             Indivision
                        </div>
                        <AlertCircle size={20} className="text-qorange" />
                     </div>
                     <h3 className="text-xl font-black text-qnavy-dark mb-1">Immeuble Le Plateau</h3>
                     <p className="text-xs font-bold text-qtext-mid mb-6 flex items-center gap-1">Héritage Banny</p>
                     
                     <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Répartition des revenus (IFU)</p>
                         <div className="w-full h-4 flex rounded-full overflow-hidden">
                             <div className="bg-qnavy h-full" style={{width: '33.3%'}} title="Héritier 1 - 33.3%"></div>
                             <div className="bg-qblue h-full" style={{width: '33.3%'}} title="Héritier 2 - 33.3%"></div>
                             <div className="bg-qorange h-full" style={{width: '33.4%'}} title="Héritier 3 - 33.4%"></div>
                         </div>
                         <div className="flex justify-between text-[10px] font-bold text-qtext-mid mt-1">
                             <span>Compte pivot agence unique</span>
                             <span className="text-qgreen">Mandat Signé</span>
                         </div>
                     </div>
                 </div>

                 {/* Educative Panel */}
                 <div className="bg-[linear-gradient(135deg,#6b21a8_0%,#3b0764_100%)] border border-purple-800 rounded-[2rem] p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                     <FileSignature className="absolute -right-5 -bottom-5 text-white opacity-10" size={120} />
                     <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 mb-2">Conformité Fiscale Absolue</h3>
                        <p className="text-sm text-purple-100 font-medium leading-relaxed">Le module de succession QAPRIL est directement grevé à la génération de quittances. Les montants sont automatiquement splittés en comptabilité (IFU) pour les impôts de chaque héritier.</p>
                     </div>
                 </div>
            </div>
        </div>
    )
}
