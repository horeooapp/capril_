"use client"

import { useState } from "react";
import { 
  BarChart3, Plus, Settings2, FileText, 
  Droplet, Zap, Trash2, Home, 
  TrendingUp, TrendingDown, DollarSign, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChargesManagerProps {
  leaseId: string;
  provisionMontant?: number;
}

const CHARGE_TYPES = [
  { id: "WATER", label: "Eau / SODECI", icon: <Droplet className="w-4 h-4" /> },
  { id: "ELEC", label: "Électricité / CIE", icon: <Zap className="w-4 h-4" /> },
  { id: "GARBAGE", label: "Ordures Ménagères", icon: <Trash2 className="w-4 h-4" /> },
  { id: "COMMON", label: "Charges Communes", icon: <Home className="w-4 h-4" /> },
];

export default function ChargesManager({ leaseId, provisionMontant = 0 }: ChargesManagerProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [provision, setProvision] = useState(provisionMontant);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["WATER", "ELEC"]);

  const totalCollected = provision * 12;
  const totalExpenses = 485000; // Mock real expenses
  const delta = totalCollected - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Provision Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl flex items-center justify-center">
             <DollarSign className="w-8 h-8 text-indigo-500/20" />
          </div>
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1 block">Provision Mensuelle</span>
          <h3 className="text-3xl font-black text-white">{provision.toLocaleString()} <span className="text-sm font-medium text-gray-500">FCFA</span></h3>
          <button 
            onClick={() => setShowSetup(true)}
            className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-all"
          >
            <Settings2 className="w-4 h-4" /> Paramétrer
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
             <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">État Annuel (Delta)</span>
             <div className={`p-2 rounded-xl ${delta >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
             </div>
          </div>
          <h3 className={`text-2xl font-black ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {delta >= 0 ? '+' : ''}{delta.toLocaleString()} FCFA
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{delta >= 0 ? 'Surplus pour le locataire' : 'Régularisation à percevoir'}</p>
        </div>

        {/* Action Card */}
        <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-600/20 flex flex-col justify-between group cursor-pointer hover:bg-indigo-500 transition-all">
           <div>
              <h4 className="text-white font-black uppercase tracking-tight text-lg mb-1">Régularisation</h4>
              <p className="text-indigo-200 text-xs">Clôturer l'exercice 2025.</p>
           </div>
           <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest mt-6">
             Lancer Maintenant <Plus className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
              Répartition des Charges
            </h3>
            <div className="flex gap-2">
               {selectedTypes.map(t => (
                 <span key={t} className="text-[9px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-gray-700">
                    {t}
                 </span>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                  <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                  <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="bg-indigo-600 h-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-800">
                {CHARGE_TYPES.map((cat, idx) => (
                  <div key={cat.id} className="flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-gray-500">
                        {cat.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                     </div>
                     <p className="text-white font-bold">{((idx + 1) * 25000).toLocaleString()} FCFA</p>
                  </div>
                ))}
            </div>
         </div>

         {/* Landlord Statement Placeholder */}
         <div className="mt-12 p-8 bg-gray-950 border border-indigo-500/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-indigo-500/5 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-indigo-500" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Compte-Rendu Gestion (CRG)</h4>
                  <p className="text-sm text-gray-600 font-medium">Édition de Mars 2026 • Prêt pour envoi</p>
               </div>
            </div>
            <button className="px-8 py-4 bg-gray-900 border border-gray-800 hover:border-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3">
               Visualiser le PDF <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
}
