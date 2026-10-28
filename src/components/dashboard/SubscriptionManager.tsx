"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

interface Props {
  currentPlan: string;
}

export const SubscriptionManager: React.FC<Props> = ({ currentPlan }) => {
  const [isManaging, setIsManaging] = useState(false);
  const [activePlan, setActivePlan] = useState(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    { name: "PROPRIÉTAIRE", price: "Libre", desc: "Facturation par quittance générée", color: "text-slate-500", bg: "bg-slate-50" },
    { name: "AGENCE INTERMÉDIAIRE", price: "Libre", desc: "Facturation par quittance générée", color: "text-amber-600", bg: "bg-orange-50" },
    { name: "DIASPORA VIP", price: "2 500 XOF/mois", desc: "Tableau de bord VIP, rapports et inspection", color: "text-indigo-600", bg: "bg-indigo-50" }
  ];

  const handleSwitchPlan = (planName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setActivePlan(planName);
      setIsProcessing(false);
      setIsManaging(false);
      alert(`Votre abonnement est passé à ${planName} !`);
    }, 1500);
  };

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white relative overflow-hidden">
      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-3">
        <CreditCard size={22} className="text-amber-600" />
        Services & Abonnement
      </h3>
      
      <div className="p-6 bg-amber-600/5 rounded-[2rem] border border-amber-600/10 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Actuel</p>
            <p className="text-xl font-black text-amber-600">{activePlan}</p>
          </div>
          <span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black text-amber-600 border border-amber-600/20 shadow-sm">ACTIVE</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isManaging ? (
          <motion.button 
            key="manage-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsManaging(true)}
            className="w-full py-4 bg-white border border-gray-100 text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            Gérer mon abonnement
            <ArrowUpRight size={14} />
          </motion.button>
        ) : (
          <motion.div 
            key="management-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t border-slate-100"
          >
            {plans.map((p) => (
              <div key={p.name} className={`p-4 rounded-xl border border-slate-100 ${p.bg} transition-all`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${p.color}`}>{p.name}</h4>
                  {activePlan === p.name ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                       Actuel <CheckCircle2 size={12}/>
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-3">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{p.price}</span>
                  {activePlan !== p.name && (
                    <button 
                      onClick={() => handleSwitchPlan(p.name)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-800 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? "Traitement..." : "Basculer"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsManaging(false)}
              className="w-full mt-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
