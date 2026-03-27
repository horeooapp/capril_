"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Timer, 
  ChevronRight, 
  ShieldAlert,
  ArrowUpRight,
  User,
  Zap
} from 'lucide-react';
import { Badge } from './Badge';

const mockRclTickets = [
  { id: 1, property: "Résidence Azur A12", tenant: "M. Kouassi", hoursLeft: 24, status: "critical", amount: "+15,000 FCFA" },
  { id: 2, property: "Villa Cocody 04", tenant: "Mme. Traoré", hoursLeft: 98, status: "warning", amount: "+25,000 FCFA" },
  { id: 3, property: "Appartement Plateau", tenant: "M. Diop", hoursLeft: 130, status: "safe", amount: "+10,000 FCFA" }
];

export const RclMonitor: React.FC = () => {
  const [tickets, setTickets] = useState(mockRclTickets);

  const simulateResolution = (id: number) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">RCL-144 Monitor.</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11] mt-1">Surveillance des Révisions de Loyer — Règle 6.1</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tickets Critiques</span>
                <span className="text-lg font-black text-[#1F4E79]">01</span>
             </div>
             <div className="bg-[#1F4E79] px-6 py-3 rounded-2xl text-white shadow-xl shadow-blue-900/20 flex items-center gap-3">
                <Zap size={16} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Taux d'automatisation</span>
                <span className="text-lg font-black">94%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Tickets List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Procédures en cours</h3>
              <button className="text-[10px] font-black text-[#1F4E79] uppercase hover:underline">Voir les archives</button>
           </div>
           
           <div className="space-y-4">
              <AnimatePresence>
                 {tickets.map((t) => (
                    <motion.div 
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                       {/* Critical Pulse */}
                       {t.status === 'critical' && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                       )}

                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-5">
                             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                🏠
                             </div>
                             <div>
                                <h4 className="text-[15px] font-black text-[#1F4E79] uppercase tracking-tight">{t.property}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                   <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                      <User size={12} />
                                      {t.tenant}
                                   </div>
                                   <Badge label={t.amount} color="#C55A11" bg="#FFF7ED" size={9} />
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-3">
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                   <div className={`text-sm font-black uppercase tracking-tighter ${
                                      t.status === 'critical' ? 'text-red-500' : t.status === 'warning' ? 'text-[#C55A11]' : 'text-emerald-500'
                                   }`}>
                                      {t.hoursLeft}h Restantes
                                   </div>
                                   <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Délai RCL-144</div>
                                </div>
                                
                                <div className="w-14 h-14 relative flex items-center justify-center">
                                   <svg className="w-full h-full transform -rotate-90">
                                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                                      <motion.circle 
                                        cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                        strokeDasharray={150.8}
                                        initial={{ strokeDashoffset: 150.8 }}
                                        animate={{ strokeDashoffset: 150.8 - (150.8 * (144 - t.hoursLeft)) / 144 }}
                                        transition={{ duration: 1.5 }}
                                        className={t.status === 'critical' ? 'text-red-500' : t.status === 'warning' ? 'text-[#C55A11]' : 'text-emerald-500'}
                                      />
                                   </svg>
                                   <Clock size={16} className="absolute text-slate-400" />
                                </div>
                             </div>

                             <button 
                               onClick={() => simulateResolution(t.id)}
                               className="px-6 py-2 bg-slate-50 text-[#1F4E79] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1F4E79] hover:text-white transition-all shadow-sm"
                             >
                                Relancer le Bailleur
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        {/* Right: Policy & Stats */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#1F4E79] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 blur-[50px] opacity-10"></div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6">Protocole RCL-144.</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                       <Clock size={20} className="text-orange-400" />
                    </div>
                    <div>
                       <h5 className="text-[12px] font-black uppercase tracking-widest">Délai Légal</h5>
                       <p className="text-[12px] text-white/60 font-medium">144 heures (6 jours calendaires) pour valider ou contester.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                       <ShieldAlert size={20} className="text-red-400" />
                    </div>
                    <div>
                       <h5 className="text-[12px] font-black uppercase tracking-widest">Sanction Auto</h5>
                       <p className="text-[12px] text-white/60 font-medium">Auto-clôture en faveur du locataire. Malus de -50 pts sur le score bailleur.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                       <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <div>
                       <h5 className="text-[12px] font-black uppercase tracking-widest">Certification</h5>
                       <p className="text-[12px] text-white/60 font-medium">SHA-256 consigné sur la blockchain QAPRIL pour validité juridique.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Impact Financier</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[12px]">
                    <span className="font-bold text-slate-400 uppercase">Volume Projeté</span>
                    <span className="font-black text-[#1F4E79]">+1,250,000 FCFA</span>
                 </div>
                 <div className="flex justify-between items-center text-[12px]">
                    <span className="font-bold text-slate-400 uppercase">Risque Auto-clôture</span>
                    <span className="font-black text-red-500">12%</span>
                 </div>
                 <div className="pt-4 border-t border-slate-50">
                    <button className="w-full py-4 bg-orange-50 text-[#C55A11] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2">
                       Ajuster les seuils
                       <ArrowUpRight size={14} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
