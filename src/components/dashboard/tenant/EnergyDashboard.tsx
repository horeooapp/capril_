"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Download,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';

const T = {
  navy: "#071A45",
  orange: "#E67E22",
  green: "#27AE60",
  blue: "#2980B9",
  grey: "#94A3B8"
};

const mockData = {
  cie: [
    { month: "Sept", kwh: 320, cost: 24500 },
    { month: "Oct", kwh: 280, cost: 19800 },
    { month: "Nov", kwh: 410, cost: 32400 },
    { month: "Déc", kwh: 390, cost: 30100 },
    { month: "Jan", kwh: 350, cost: 26800 },
    { month: "Fév", kwh: 310, cost: 22400 }
  ],
  sodeci: [
    { month: "Sept", m3: 18, cost: 8500 },
    { month: "Oct", m3: 15, cost: 6800 },
    { month: "Nov", m3: 22, cost: 11200 },
    { month: "Déc", m3: 20, cost: 9800 },
    { month: "Jan", m3: 19, cost: 9200 },
    { month: "Fév", m3: 17, cost: 7900 }
  ]
};

export const EnergyDashboard: React.FC = () => {
  const [activeProvider, setActiveProvider] = useState<'cie' | 'sodeci'>('cie');
  const data = activeProvider === 'cie' ? mockData.cie : mockData.sodeci;
  const unit = activeProvider === 'cie' ? 'kWh' : 'm³';
  const maxVal = Math.max(...data.map(d => (d as any).kwh || (d as any).m3));

  return (
    <div className="space-y-8 p-1">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Énergie & Fluides.</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11] mt-1">Suivi de consommation certifié Rule 3.4</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl flex gap-1 shadow-sm border border-slate-100">
           <button 
             onClick={() => setActiveProvider('cie')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeProvider === 'cie' ? "bg-[#1F4E79] text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
             }`}
           >
             <Zap size={14} />
             CIE (Électricité)
           </button>
           <button 
             onClick={() => setActiveProvider('sodeci')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeProvider === 'sodeci' ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
             }`}
           >
             <Droplets size={14} />
             SODECI (Eau)
           </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 transition-colors ${activeProvider === 'cie' ? "bg-orange-500" : "bg-blue-500"}`}></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Mois en cours (Estimé)</div>
            <div className="flex items-end gap-2">
               <span className="text-4xl font-black text-[#1F4E79] tracking-tighter">
                  {activeProvider === 'cie' ? "355" : "19.5"}
               </span>
               <span className="text-lg font-black text-slate-400 uppercase mb-1">{unit}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-red-500">
               <TrendingUp size={12} />
               +4.2% vs mois dernier
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Coût Prévisionnel</div>
            <div className="flex items-end gap-2">
               <span className="text-4xl font-black text-[#C55A11] tracking-tighter">27 450</span>
               <span className="text-lg font-black text-slate-400 uppercase mb-1">FCFA</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600">
               <ShieldCheck size={12} />
               Tarif Social Appliqué
            </div>
         </div>

         <div className="bg-[#1F4E79] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
               {activeProvider === 'cie' ? <Zap size={120} /> : <Droplets size={120} />}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Statut de Facturation</div>
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
               </div>
               <div>
                  <div className="text-lg font-black uppercase tracking-tighter leading-none">Paiement Requis.</div>
                  <div className="text-[9px] font-black uppercase text-orange-400 mt-1">Echéance : 05 Avril 2026</div>
               </div>
            </div>
         </div>
      </div>

      {/* Consumption Chart */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Historique 6 Mois.</h3>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Évolution de votre empreinte énergétique</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-slate-100"></div> Moyenne Quartier
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#1F4E79]">
                  <div className={`w-3 h-3 rounded-full ${activeProvider === 'cie' ? "bg-orange-500" : "bg-blue-500"}`}></div> Ma Consommation
               </div>
            </div>
         </div>

         <div className="h-64 flex items-end justify-between gap-4 px-4">
            {data.map((d: any, i) => (
               <div key={i} className="flex-grow flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl pointer-events-none">
                     {d.cost.toLocaleString()} FCFA
                  </div>
                  
                  {/* Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${((d.kwh || d.m3) / maxVal) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className={`w-full max-w-[60px] rounded-t-2xl relative cursor-pointer hover:brightness-110 transition-all ${
                      activeProvider === 'cie' ? "bg-gradient-to-t from-orange-400 to-orange-500" : "bg-gradient-to-t from-blue-400 to-blue-500"
                    }`}
                  >
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10 rounded-t-2xl"></div>
                  </motion.div>
                  
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">{d.month}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Invoice List */}
      <div className="bg-slate-50 p-8 rounded-[3rem] border border-white shadow-inner">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-widest italic">Dernières Factures.</h3>
            <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Voir tout l'historique</button>
         </div>
         <div className="space-y-3">
            {[1, 2, 3].map((f) => (
               <div key={f} className="bg-white p-5 rounded-3xl flex items-center justify-between border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Calendar size={20} />
                     </div>
                     <div>
                        <div className="text-[13px] font-black text-[#1F4E79] uppercase">Facture {activeProvider.toUpperCase()} — {f === 1 ? 'Janvier 2026' : 'Décembre 2025'}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Référence : #{activeProvider.toUpperCase()}-00{f}82</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <div className="text-[15px] font-black text-slate-900 font-mono">24 850 FCFA</div>
                        <div className="flex items-center gap-1 justify-end">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                           <span className="text-[9px] font-black text-green-600 uppercase">Payée</span>
                        </div>
                     </div>
                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <Download size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Advice Section */}
      <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex flex-col md:flex-row items-center gap-8">
         <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
            <Info size={32} />
         </div>
         <div>
            <h4 className="text-lg font-black text-blue-900 uppercase tracking-tighter italic">Optimisez votre facture.</h4>
            <p className="text-[12px] font-medium text-blue-800/70 leading-relaxed max-w-2xl mt-1">
               Votre consommation de pointe se situe entre 19h et 22h. En décalant certains usages (climatisation, lavage) vers les heures creuses, vous pourriez économiser jusqu'à <span className="text-blue-900 font-bold">4 500 FCFA</span> par mois sur votre tarif CIE.
            </p>
         </div>
         <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-900/20 whitespace-nowrap ml-auto">
            Consulter les astuces
         </button>
      </div>
    </div>
  );
};
