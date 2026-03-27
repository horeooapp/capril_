"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Plus, 
  Trash2, 
  Eye,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const T = {
  navy: "#071A45",
  orange: "#E67E22",
  green: "#27AE60",
  red: "#C0392B",
  grey: "#94A3B8"
};

const entryImage = "/edl_entry_living_room_1774574996153.png";
const exitImage = "/edl_exit_living_room_damaged_1774575009346.png";

export const EdlComparator: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [degradations, setDegradations] = useState([
    { id: 1, label: "Trous dans cloison (Mur Est)", cost: 45000, qty: 1, category: "Murs" },
    { id: 2, label: "Tâches indélébiles sur parquet", cost: 125000, qty: 1, category: "Sols" },
    { id: 3, label: "Nettoyage profondeur requis", cost: 25000, qty: 1, category: "Divers" }
  ]);

  const totalRetenue = degradations.reduce((acc, d) => acc + (d.cost * d.qty), 0);
  const cautionConsignee = 450000;
  const soldeRestituer = cautionConsignee - totalRetenue;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">M-EDL Comparator.</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11]">Audit Comparatif Entrée/Sortie — Réf #EDL-2026-042</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} />
            Export Certifié PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1F4E79] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-blue-900/20">
            <ShieldCheck size={16} />
            Signer & Clôturer
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Comparison */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Visualisation Interactive.</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest">Entry: May 2025</span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[9px] font-black uppercase tracking-widest">Exit: March 2026</span>
              </div>
            </div>

            {/* Image Comparison Slider */}
            <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden cursor-ew-resize select-none bg-slate-900 border-4 border-white shadow-2xl">
              <img 
                src={exitImage} 
                alt="Exit" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden" 
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img 
                  src={entryImage} 
                  alt="Entry" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize group shadow-xl"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-[#1F4E79] group-hover:scale-110 transition-transform">
                  <div className="flex gap-0.5">
                    <ChevronLeft size={14} className="text-[#1F4E79]" />
                    <ChevronRight size={14} className="text-[#1F4E79]" />
                  </div>
                </div>
                <div className="absolute top-4 -translate-x-1/2 left-1/2 px-3 py-1 bg-[#1F4E79] text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   Faites glisser pour comparer
                </div>
              </div>

              {/* Interaction Overlay */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm font-black">ENT</div>
                <div>
                   <div className="text-[10px] font-black uppercase text-slate-400">Statut Entrée</div>
                   <div className="text-[13px] font-black text-slate-800 uppercase">Pristine / Neuf</div>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-4 border border-red-100/50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm font-black">EXT</div>
                <div>
                   <div className="text-[10px] font-black uppercase text-red-400">Statut Sortie</div>
                   <div className="text-[13px] font-black text-red-800 uppercase">Dégradations mineures</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Logs */}
          <div className="bg-[#1F4E79] p-8 rounded-[3rem] text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
             <h3 className="text-xl font-black tracking-tighter uppercase mb-6 italic leading-none">Journal d'Audit.</h3>
             <div className="space-y-4">
                <div className="flex gap-4 items-start border-l-2 border-orange-500/30 pl-4 py-1">
                   <span className="text-[11px] font-mono text-orange-400">10:42</span>
                   <p className="text-[12px] font-bold">Photos de sortie synchronisées depuis l'application mobile M-EDL.</p>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-white/10 pl-4 py-1">
                   <span className="text-[11px] font-mono text-slate-400">10:45</span>
                   <p className="text-[12px] font-bold">Détection automatique de 3 anomalies (Mur A1, Sol B2, Plafond C1).</p>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-white/10 pl-4 py-1">
                   <span className="text-[11px] font-mono text-slate-400">11:02</span>
                   <p className="text-[12px] font-bold">Évaluation du coût des travaux mise à jour selon le barème QAPRIL 2026.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Deductions & Billing */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Calcul des Retenues.</h2>
            
            <div className="space-y-6 flex-grow">
              {degradations.map((d) => (
                <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#C55A11]">{d.category}</span>
                      <h4 className="text-[13px] font-black text-[#1F4E79] uppercase tracking-tight">{d.label}</h4>
                    </div>
                    <button 
                      onClick={() => setDegradations(degradations.filter(x => x.id !== d.id))}
                      className="p-1.5 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QAPRIL Estimate</span>
                    <span className="text-[15px] font-black text-slate-900 font-mono tracking-tighter">{d.cost.toLocaleString()} FCFA</span>
                  </div>
                </div>
              ))}

              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-[#1F4E79] hover:text-[#1F4E79] transition-all group">
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">Ajouter une dégradation</span>
              </button>
            </div>

            <div className="mt-12 space-y-4 pt-8 border-t border-slate-100">
               <div className="flex justify-between items-center text-[12px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Caution Consignée (CDC)</span>
                  <span>{cautionConsignee.toLocaleString()} FCFA</span>
               </div>
               <div className="flex justify-between items-center text-[12px] font-black text-red-500 uppercase tracking-widest">
                  <span>Total Retenues</span>
                  <span>-{totalRetenue.toLocaleString()} FCFA</span>
               </div>
               <div className="p-6 bg-[#C55A11] text-white rounded-[2rem] mt-4 shadow-xl shadow-orange-900/10">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 text-center">Reste à restituer</div>
                  <div className="text-3xl font-black text-center tracking-tighter font-mono">{soldeRestituer.toLocaleString()} FCFA</div>
               </div>
               
               <p className="text-[9px] font-bold text-slate-400 italic text-center leading-relaxed mt-4">
                  Calcul certifié selon le cadre légal QAPRIL 2026.<br/>
                  Le locataire dispose de 72h pour contester.
               </p>

               <button className="w-full py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 mt-6">
                  Valider le solde
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
