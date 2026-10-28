'use client'
import { toast } from "sonner";

import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Download,
  ShieldCheck,
  Smartphone,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useWalletData } from '@/hooks/qapril-web-hooks';
import RechargeDrawer from './RechargeDrawer';
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function WalletDashboard() {
  const { data, loading, error, recharge, refresh } = useWalletData();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  if (loading && !data) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center animate-spin mx-auto text-slate-400">
          <Zap size={32} />
        </div>
        <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Synchronisation du Solde...</p>
      </div>
    );
  }

  const { solde, historique, stats, decouvertMax, role } = data || { solde: 0, historique: [], stats: { consoMensuelle: 0, nbBails: 0 }, decouvertMax: -1500, role: 'TENANT' };
  const isOverdrawn = solde < 0;
  const isCritical = solde <= decouvertMax;
  const isPro = role === 'LANDLORD_PRO' || role === 'AGENCY';

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <Wallet className="text-slate-700" size={32} /> E-Wallet
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <Badge color={isPro ? "violet" : "gray"}>
                    {isPro ? "Compte Professionnel" : "Compte Particulier"}
                </Badge>
                <p className="text-[13.5px] font-medium text-slate-500">
                    {isPro ? "Gestion des encaissements et commissions." : "Gérez votre solde pour l'envoi de quittances automated."}
                </p>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
                onClick={() => setIsRechargeOpen(true)}
                className="bg-slate-800 text-white px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-700 transition-all shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none">
                <Zap size={16} /> Recharger
            </button>
            <Link 
                href="/dashboard/wallet/settings"
                className="bg-white text-slate-700 border border-slate-200 px-4 sm:px-6 py-2.5 rounded-[10px] font-semibold text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none">
                Configuration
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
         {/* Main Balance Big Card */}
         <div className={`col-span-1 lg:col-span-2 rounded-[12px] p-6 text-white relative overflow-hidden shadow-sm ${isOverdrawn ? 'bg-rose-600' : 'bg-slate-800'}`}>
            <Wallet size={120} className="absolute -right-6 -bottom-6 text-white opacity-5" />
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-1">Solde Disponible</h3>
                  <div className="flex items-baseline gap-2">
                     <p className="text-4xl font-black tracking-tight mt-1">{solde.toLocaleString()}</p>
                     <span className="text-sm font-medium text-white/70">FCFA</span>
                  </div>
                  {isOverdrawn && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-[4px] text-[10px] font-bold uppercase tracking-widest">
                      <AlertTriangle size={12} /> Découvert technique actif
                    </div>
                  )}
               </div>
               <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase text-white/40 tracking-widest mb-0.5">Moyenne Mensuelle</p>
                    <p className="text-[13px] font-semibold">{stats.consoMensuelle.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-white/40 tracking-widest mb-0.5">Autonomie</p>
                    <p className="text-[13px] font-semibold">{stats.autonomieMois} Mois</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Standard Stats */}
         <div className="flex flex-col gap-3">
             <StatCard 
                 label="Découvert" 
                 value={`${Math.abs(decouvertMax).toLocaleString()} XOF`} 
                 sub="Tolérance plafond" 
             />
             <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-4 flex-1 flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-1">
                     <ShieldCheck size={16} className="text-emerald-600" />
                     <p className="text-[12px] font-semibold text-emerald-700 uppercase">Protection</p>
                 </div>
                 <p className="text-[11px] text-emerald-800 mt-1">Vos services restent actifs dans la limite de la tolérance fixée.</p>
             </div>
         </div>

         <div className="flex flex-col gap-3">
             <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4 h-full flex flex-col justify-between group relative overflow-hidden">
                <Smartphone size={60} className="absolute -right-4 -bottom-4 text-slate-200 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Support QAPRIL</p>
                    <p className="text-[14px] font-bold text-slate-800 mt-2 leading-snug">Un problème avec votre solde ou rechargement ?</p>
                </div>
                <button className="text-[11px] font-bold text-sky-600 uppercase tracking-wide flex items-center gap-1.5 mt-4 group-hover:gap-2 transition-all relative z-10" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Redirection...', success: 'Support contacté.'}) }}>
                    WhatsApp Direct <ArrowUpRight size={14} />
                </button>
             </div>
         </div>
      </div>

      <SectionCard 
        title="Historique des flux financiers" 
        action={
            <button 
                onClick={(e) => { 
                    e.preventDefault(); 
                    toast.success('Génération du relevé certifié...');
                    window.print();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
               <Download size={14} /> Relevé PDF
            </button>
        } 
        noPadding
      >
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Nature</th>
                        <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Date</th>
                        <th className="py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Référence</th>
                        <th className="text-right py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {historique.map((tx: any) => (
                        <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-[6px] shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <span className="font-semibold text-[12.5px] text-slate-700">{tx.label}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-[12px] font-medium text-slate-500">
                                {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] tracking-wide text-slate-400">
                                {tx.reference.substring(0, 15)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <p className={`font-bold text-[13px] ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} XOF
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Solde: {tx.balanceAfter.toLocaleString()} XOF</p>
                            </td>
                        </tr>
                    ))}
                    {historique.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-8 text-center bg-slate-50/50">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <Clock size={24} className="mb-2 opacity-50" />
                                    <p className="text-[12.5px] font-semibold">Aucune transaction trouvée.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </SectionCard>

      <RechargeDrawer 
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
          suggestedAmount={2000}
          onRecharge={recharge}
      />
    </div>
  );
}
