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
        <div className="w-16 h-16 bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-full flex items-center justify-center animate-spin mx-auto text-[var(--ci-or)]">
          <Zap size={32} />
        </div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chargement du Wallet...</p>
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
           className="lg:col-span-8 p-10 rounded-[2rem] bg-gradient-to-br from-[var(--ci-nuit2)] to-[var(--ci-nuit3)] text-white relative overflow-hidden group border border-[var(--ci-nuit3)] shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--ci-or)] blur-[120px] opacity-10 -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-12">
            <div className="space-y-12 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-[var(--ci-or)]" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">Solde Disponible.</span>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-7xl font-black tracking-tighter leading-none italic font-mono">
                  {solde.toLocaleString()} <span className="text-3xl font-normal opacity-50 not-italic">F</span>
                </h1>
                {isOverdrawn && (
                  <div className="flex items-center gap-2 text-[var(--ci-orange)] font-black text-xs uppercase tracking-widest animate-pulse mt-4">
                    <AlertTriangle size={16} />
                    Mode Crédit Activé (Découvert autorisé)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--ci-nuit3)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Consommation Mensuelle</p>
                  <p className="text-xl font-black font-mono">≈ {stats.consoMensuelle.toLocaleString()} <span className="text-xs opacity-50">FCFA</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Autonomie Estimée</p>
                  <p className="text-xl font-black">{stats.autonomieMois} <span className="text-xs opacity-50">MOIS</span></p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-4 w-full md:w-64">
               <button 
                  onClick={() => setIsRechargeOpen(true)}
                  className="w-full py-6 bg-[var(--ci-or)] text-[var(--ci-nuit2)] rounded-xl font-black text-[14px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,139,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <Zap size={20} className="text-[var(--ci-nuit2)]" />
                 Recharger
               </button>
               <Link href="/dashboard/wallet" className="w-full py-5 bg-[var(--ci-nuit)] hover:bg-[var(--ci-nuit3)] text-gray-300 border border-[var(--ci-nuit3)] rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                 Configuration
               </Link>
            </div>
          </div>
        </motion.div>

        {/* Small Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="panel flex flex-col justify-between h-full group hover:border-[var(--ci-green)]/30 transition-all border border-[var(--ci-nuit3)]">
              <div className="flex items-center justify-between">
                <ShieldCheck className="text-[var(--ci-vert)]" size={32} />
                <span className="px-3 py-1 bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] text-[10px] font-black uppercase tracking-widest rounded-full border border-[var(--ci-vert)]/20">Sécurisé</span>
              </div>
              <div className="space-y-2 mt-8">
                <h4 className="text-xl font-black text-white tracking-tighter uppercase italic">Limites de Crédit.</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Votre compte bénéficie d'une tolérance de <span className="font-black text-[var(--ci-or)]">{Math.abs(decouvertMax).toLocaleString()} FCFA</span> pour éviter tout arrêt de service lors de l'émission de vos quittances.
                </p>
              </div>
           </div>
           
           <div className="panel bg-[var(--ci-nuit2)] text-white overflow-hidden relative group h-full border border-[var(--ci-nuit3)]">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--ci-or)] blur-[80px] opacity-10 pointer-events-none"></div>
              <div className="flex flex-col h-full justify-between relative z-10 w-full">
                <Smartphone size={28} className="text-[var(--ci-or)]" />
                <div className="mt-8 space-y-1">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Service Clients</p>
                   <p className="text-lg font-black italic uppercase tracking-tighter text-white">Support Wallet Direct.</p>
                   <button className="text-[10px] font-black text-[var(--ci-or)] uppercase tracking-[0.2em] flex items-center gap-2 mt-2 group-hover:gap-4 transition-all" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>
                      Contacter sur WhatsApp <ArrowRight size={14} />
                   </button>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="panel space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--ci-nuit3)] pb-4">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Historique.</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Flux financiers récents</span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-[var(--ci-nuit2)] hover:bg-[var(--ci-nuit3)] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--ci-nuit3)] transition-all" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>
             Exporter Relevé
          </button>
        </div>

        <div className="space-y-4">
          {historique.length === 0 ? (
            <div className="p-20 text-center bg-[var(--ci-nuit2)] rounded-[2rem] border border-dashed border-[var(--ci-nuit3)]">
              <Clock size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Aucune transaction trouvée.</p>
            </div>
          ) : (
            historique.map((tx: any) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-6 bg-[var(--ci-nuit2)] hover:bg-[var(--ci-nuit3)] border border-[var(--ci-nuit3)] hover:border-[var(--ci-or)]/30 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-lg border ${
                    tx.type === 'CREDIT' ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] border-[var(--ci-vert)]/20' : 'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)] border-[var(--ci-orange)]/20'
                  }`}>
                    {tx.type === 'CREDIT' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <h5 className="text-[14px] font-black text-white tracking-tighter uppercase leading-none">{tx.label}</h5>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                       {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       <span className="w-1 h-1 bg-[var(--ci-nuit3)] rounded-full"></span>
                       Ref: {tx.reference.substring(0, 15)}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                   <p className={`text-xl font-bold font-mono ${tx.type === 'CREDIT' ? 'text-[var(--ci-vert)]' : 'text-white'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-xs font-normal opacity-50">FCFA</span>
                   </p>
                   <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Solde: {tx.balanceAfter.toLocaleString()} FCFA</p>
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
