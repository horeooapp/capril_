'use client'
import { toast } from "sonner";;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useWalletData } from '@/hooks/qapril-web-hooks';
import RechargeDrawer from './RechargeDrawer';

export default function WalletDashboard() {
  const { data, loading, error, recharge, refresh } = useWalletData();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  if (loading && !data) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center animate-spin mx-auto text-[#1F4E79]">
          <Zap size={32} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement du Wallet...</p>
      </div>
    );
  }

  const { solde, historique, stats, decouvertMax } = data || { solde: 0, historique: [], stats: { consoMensuelle: 0, nbBails: 0 }, decouvertMax: -1500 };
  const isOverdrawn = solde < 0;
  const isCritical = solde <= decouvertMax;

  return (
    <div className="space-y-12">
      {/* Wallet Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Card */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-8 p-12 rounded-[4rem] bg-[#1F4E79] text-white relative overflow-hidden group shadow-blue-900/40 shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C55A11] blur-[120px] opacity-10 -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-12">
            <div className="space-y-12 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-[#C55A11]" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/60">Solde Disponible.</span>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-7xl font-black tracking-tighter leading-none italic">
                  {solde.toLocaleString()} <span className="text-3xl font-normal opacity-50 not-italic">FCFA</span>
                </h1>
                {isOverdrawn && (
                  <div className="flex items-center gap-2 text-[#C55A11] font-black text-xs uppercase tracking-widest animate-pulse">
                    <AlertTriangle size={16} />
                    Mode Crédit Activé (Découvert autorisé)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Consommation Mensuelle</p>
                  <p className="text-xl font-black">≈ {stats.consoMensuelle.toLocaleString()} <span className="text-xs opacity-40">FCFA</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Autonomie Estimée</p>
                  <p className="text-xl font-black">{stats.autonomieMois} <span className="text-xs opacity-40">MOIS</span></p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-4 w-full md:w-64">
               <button 
                  onClick={() => setIsRechargeOpen(true)}
                  className="w-full py-6 bg-[#C55A11] text-white rounded-[2rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-xl shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <Zap size={20} />
                 Recharger
               </button>
               <Link href="/dashboard/wallet" className="w-full py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                 Configuration
               </Link>
            </div>
          </div>
        </motion.div>

        {/* Small Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass-panel p-8 rounded-[3rem] border border-white group hover:shadow-2xl transition-all h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <ShieldCheck className="text-emerald-500" size={32} />
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Sécurisé</span>
              </div>
              <div className="space-y-2 mt-8">
                <h4 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Limites de Crédit.</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Votre compte bénéficie d'une tolérance de <span className="font-black text-[#C55A11]">{Math.abs(decouvertMax).toLocaleString()} FCFA</span> pour éviter tout arrêt de service lors de l'émission de vos quittances.
                </p>
              </div>
           </div>
           <div className="bg-gray-900 text-white p-8 rounded-[3rem] overflow-hidden relative group h-full">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#C55A11] blur-[80px] opacity-20"></div>
              <div className="flex flex-col h-full justify-between relative z-10">
                <Smartphone size={28} className="text-[#C55A11]" />
                <div className="mt-8 space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Service Clients</p>
                   <p className="text-lg font-black italic uppercase tracking-tighter">Support Wallet Direct.</p>
                   <button className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.2em] flex items-center gap-2 mt-2 group-hover:gap-4 transition-all" onClick={(e) => { e.preventDefault(); toast.info('🚀 Module V5 : Interface en cours d\'intégration (Premium)') }}>
                      Contacter sur WhatsApp <ArrowRight size={14} />
                   </button>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Historique.</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Flux financiers récents</span>
              <span className="h-[1px] w-8 bg-gray-200"></span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-gray-50 hover:bg-white text-[#1F4E79] rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-gray-100 shadow-sm" onClick={(e) => { e.preventDefault(); toast.info('🚀 Module V5 : Interface en cours d\'intégration (Premium)') }}>
             Exporter Relevé
          </button>
        </div>

        <div className="space-y-4">
          {historique.length === 0 ? (
            <div className="p-20 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
              <Clock size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Aucune transaction trouvée.</p>
            </div>
          ) : (
            historique.map((tx: any) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-8 bg-white hover:bg-gray-50/50 border border-gray-100 rounded-[2.5rem] transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                    tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-ivoire-orange'
                  }`}>
                    {tx.type === 'CREDIT' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <h5 className="text-lg font-black text-[#1F4E79] tracking-tighter uppercase leading-none">{tx.label}</h5>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                       Ref: {tx.reference.substring(0, 15)}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                   <p className={`text-2xl font-black ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-[#1F4E79]'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-sm font-normal opacity-50">FCFA</span>
                   </p>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Solde: {tx.balanceAfter.toLocaleString()} FCFA</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <RechargeDrawer 
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
          suggestedAmount={2000}
          onRecharge={recharge}
      />
    </div>
  );
}
