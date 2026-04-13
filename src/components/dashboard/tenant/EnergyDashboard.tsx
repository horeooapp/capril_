"use client"
import { toast } from "sonner";

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
import UploadFactureOCR from "@/components/dashboard/utilities/UploadFactureOCR";

const T = {
  navy: "#071A45",
  orange: "#E67E22",
  green: "#27AE60",
  blue: "#2980B9",
  grey: "#94A3B8"
};

export const EnergyDashboard: React.FC<{ leaseId?: string, utilities?: any[] }> = ({ leaseId, utilities = [] }) => {
  const [activeProvider, setActiveProvider] = useState<'cie' | 'sodeci'>('cie');
  
  // Filtrage et formatage des données réelles
  const filteredData = utilities
    .filter(u => u.typeUtility.toLowerCase() === activeProvider)
    .map(u => ({
      month: u.moisFacture, // Format "YYYY-MM"
      val: u.montantTotal,
      cost: u.montantTotal
    }))
    .reverse(); // Ordre chronologique

  const hasData = filteredData.length > 0;
  const unit = activeProvider === 'cie' ? 'kWh' : 'm³';
  const unitLabel = activeProvider === 'cie' ? 'Consommation' : 'Volume';
  const maxVal = hasData ? Math.max(...filteredData.map(d => d.val)) : 100;

  if (!hasData) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Énergie & Fluides.</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11] mt-1">Suivi de consommation certifié Rule 3.4</p>
          </div>
          <div className="bg-white p-1.5 rounded-2xl flex gap-1 shadow-sm border border-slate-100">
             <button onClick={() => setActiveProvider('cie')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeProvider === 'cie' ? "bg-[#1F4E79] text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>CIE</button>
             <button onClick={() => setActiveProvider('sodeci')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeProvider === 'sodeci' ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>SODECI</button>
          </div>
        </div>
        
        <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Zap size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Aucune donnée pour {activeProvider.toUpperCase()}</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-sm">
            Scannez votre première facture pour activer votre dashboard énergétique et comparer votre consommation avec la moyenne nationale.
          </p>
          <div className="pt-4">
            <UploadFactureOCR leaseId={leaseId || "LOCATAIRE_SESSION_MOCK"} />
          </div>
        </div>
      </div>
    );
  }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

  return (
    <div className="space-y-8 p-1">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Énergie & Fluides.</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11] mt-1">Suivi de consommation certifié Rule 3.4</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1 shadow-sm border border-slate-100">
           <button 
             onClick={() => setActiveProvider('cie')}
             className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeProvider === 'cie' ? "bg-[#1F4E79] text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
             }`}
           >
             <Zap size={14} />
             CIE
           </button>
           <button 
             onClick={() => setActiveProvider('sodeci')}
             className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeProvider === 'sodeci' ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
             }`}
           >
             <Droplets size={14} />
             SODECI
           </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
         <motion.div variants={itemVariants} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 transition-colors ${activeProvider === 'cie' ? "bg-orange-500" : "bg-blue-500"}`}></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Mois en cours (Estimé)</div>
            <div className="flex items-end gap-2">
               <span className="text-3xl sm:text-4xl font-black text-[#1F4E79] tracking-tighter">
                  {activeProvider === 'cie' ? "355" : "19.5"}
               </span>
               <span className="text-lg font-black text-slate-400 uppercase mb-1">{unit}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-red-500">
               <TrendingUp size={12} />
               +4.2% vs mois dernier
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Coût Prévisionnel</div>
            <div className="flex items-end gap-2">
               <span className="text-3xl sm:text-4xl font-black text-[#C55A11] tracking-tighter">27 450</span>
               <span className="text-lg font-black text-slate-400 uppercase mb-1">FCFA</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600">
               <ShieldCheck size={12} />
               Tarif Social Appliqué
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-[#1F4E79] p-6 sm:p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
               {activeProvider === 'cie' ? <Zap size={120} /> : <Droplets size={120} />}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Statut de Facturation</div>
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={24} />
               </div>
               <div>
                  <div className="text-lg font-black uppercase tracking-tighter leading-none">Paiement Requis.</div>
                  <div className="text-[9px] font-black uppercase text-orange-400 mt-1">Echéance : 05 Avril 2026</div>
               </div>
            </div>
         </motion.div>
      </motion.div>

      {/* Consumption Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 sm:p-10 rounded-[3rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar"
      >
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12">
            <div>
               <h3 className="text-lg sm:text-xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Historique 6 Mois.</h3>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Évolution de votre empreinte énergétique</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
               <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-400">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-slate-100"></div> Moyenne Quartier
               </div>
               <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[#1F4E79]">
                  <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${activeProvider === 'cie' ? "bg-orange-500" : "bg-blue-500"}`}></div> Ma Consommation
               </div>
            </div>
         </div>

         <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 min-w-[500px] sm:min-w-0">
            {filteredData.map((d: any, i) => (
               <div key={i} className="flex-grow flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl pointer-events-none">
                     {d.cost.toLocaleString()} FCFA
                  </div>
                  
                  {/* Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.val / maxVal) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
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
      </motion.div>

      {/* OCR Scanner Section */}
      <div className="mt-8 mb-8">
        <UploadFactureOCR leaseId={leaseId || "LOCATAIRE_SESSION_MOCK"} />
      </div>

      {/* Invoice List */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-[3rem] border border-white shadow-inner">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-widest italic">Dernières Factures.</h3>
            <button className="text-[10px] font-black uppercase text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>Historique</button>
         </div>
          <div className="space-y-4">
            {filteredData.slice(0, 5).map((f: any, i: number) => (
               <div key={f.month} className="bg-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 hover:shadow-md transition-shadow gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                        <Calendar size={18} />
                     </div>
                     <div className="overflow-hidden">
                        <div className="text-[12px] sm:text-[13px] font-black text-[#1F4E79] uppercase truncate">Facture {activeProvider.toUpperCase()} — {f.month}</div>
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Réduction Profil Activée</div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0">
                     <div className="text-left sm:text-right">
                        <div className="text-[14px] sm:text-[15px] font-black text-slate-900 font-mono">{f.cost.toLocaleString()} FCFA</div>
                        <div className="flex items-center gap-1 sm:justify-end">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                           <span className="text-[9px] font-black text-green-600 uppercase">Payée</span>
                        </div>
                     </div>
                     <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>
                        <Download size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Advice Section */}
      <div className="p-6 sm:p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex flex-col items-center sm:items-start md:flex-row gap-6 sm:gap-8">
         <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
            <Info size={32} />
         </div>
         <div className="text-center sm:text-left">
            <h4 className="text-lg font-black text-blue-900 uppercase tracking-tighter italic">Optimisez votre facture.</h4>
            <p className="text-[11px] sm:text-[12px] font-medium text-blue-800/70 leading-relaxed max-w-2xl mt-1">
               Votre consommation de pointe se situe entre 19h et 22h. En décalant certains usages vers les heures creuses, vous pourriez économiser jusqu'à <span className="text-blue-900 font-bold">4 500 FCFA</span>/mois.
            </p>
         </div>
         <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-900/20 whitespace-nowrap md:ml-auto" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>
            Astuces
         </button>
      </div>
    </div>
  );
};
