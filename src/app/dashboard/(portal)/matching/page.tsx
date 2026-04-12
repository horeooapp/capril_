"use client"

import React, { useState } from "react"
import { Users, X, Heart, Star, CheckCircle, ShieldAlert } from "lucide-react"
import { toast } from "sonner";

export default function MatchingDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
                <Users className="text-pink-500 mb-4" size={48} />
                <h1 className="text-3xl sm:text-5xl font-black text-qnavy-dark uppercase tracking-tighter mb-4">
                    Le Tinder de l'Immobilier
                </h1>
                <p className="text-sm font-medium text-qtext-mid">
                    Approuvez ou rejetez les candidatures entrantes pour vos biens avec un simple Swipe. L'IA de QAPRIL scrute les KYC pour vous recommander les meilleurs profils.
                </p>
            </div>

            <div className="flex justify-center">
                 {/* Tinder Card UI */}
                 <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-qgrey-2 overflow-hidden relative">
                     <div className="h-48 bg-[linear-gradient(135deg,#db2777_0%,#9d174d_100%)] relative flex items-end p-6">
                         <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <Star size={12} className="text-yellow-400 fill-yellow-400"/> Score ICL : A+
                         </div>
                         <h2 className="text-3xl font-black text-white relative z-10">Jean K.</h2>
                     </div>
                     <div className="p-8">
                          <div className="space-y-4 mb-8">
                              <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Cible</span>
                                  <span className="text-sm font-bold text-qnavy-dark">Studio Palmeraie</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-qgrey-2 pb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Revenus (Déclarés)</span>
                                  <span className="text-sm font-bold text-qgreen">1.2M FCFA / mois</span>
                              </div>
                              <div className="flex justify-between items-center pb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Vérification C-Vault</span>
                                  <span className="text-[10px] uppercase font-black bg-qgreen-pale text-qgreen px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={10}/> CNI Confirmée</span>
                              </div>
                          </div>
                          
                          <div className="flex justify-center gap-8">
                              <button onClick={() => toast.error('Candidature rejetée. Le profil ne sera plus suggéré.')} className="w-16 h-16 rounded-full bg-white border-2 border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-md">
                                  <X size={28} />
                              </button>
                              <button onClick={() => toast.success('Match Immo ! Le dossier locataire vous a été transmis.')} className="w-16 h-16 rounded-full bg-white border-2 border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-50 hover:scale-110 transition-all shadow-md">
                                  <Heart size={28} className="fill-pink-500" />
                              </button>
                          </div>
                     </div>
                     
                     <div className="bg-qgrey-1 p-4 text-center border-t border-qgrey-2">
                         <p className="text-[10px] font-bold text-qtext-mid flex items-center justify-center gap-1.5"><ShieldAlert size={12}/> QAPRIL garantit cet utilisateur.</p>
                     </div>
                 </div>
            </div>
            
            <div className="text-center mt-12">
                 <p className="text-xs font-black uppercase tracking-widest text-qtext-light mb-4">Fil d'attente</p>
                 <div className="flex justify-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                     <div className="w-2 h-2 rounded-full bg-qgrey-2"></div>
                     <div className="w-2 h-2 rounded-full bg-qgrey-2"></div>
                     <div className="w-2 h-2 rounded-full bg-qgrey-2"></div>
                 </div>
            </div>
        </div>
    )
}
