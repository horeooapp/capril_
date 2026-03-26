import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings2, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  Bot,
  Zap,
  FileText,
  Camera,
  Signature
} from 'lucide-react';
import { AgencyKpiCards } from './AgencyKpiCards';
import { AgencyPropertyList } from './AgencyPropertyList';
import { AgencyCandidateList } from './AgencyCandidateList';
import { AgencyToolsGrid } from './AgencyToolsGrid';
import { T } from '@/constants/agency-data';

type TabType = 'overview' | 'biens' | 'candidats' | 'outils';

export const AgencyPortalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'biens', label: 'Biens', icon: <Building2 size={18} /> },
    { id: 'candidats', label: 'Candidats', icon: <Users size={18} /> },
    { id: 'outils', label: 'Outils', icon: <Settings2 size={18} /> },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Agency Header - Unified with the rest of the portal */}
      <div className="px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">
              Console Agence.
            </h1>
            <p className="text-[16px] text-gray-500 font-medium tracking-wide flex items-center gap-2">
              <span className="text-[#1F4E79] font-black uppercase">Immobilière du Golfe</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[14px] font-black uppercase tracking-widest text-[#C55A11]">Agence Agréée QAPRIL</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    A{i}
                  </div>
                ))}
              </div>
              <div className="h-10 px-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center shadow-sm">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">4 Collaborateurs</span>
              </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="px-4">
        <div className="flex gap-1 bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/40 w-fit shadow-xl shadow-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-[#1F4E79] text-white shadow-2xl shadow-blue-900/20"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <AgencyKpiCards />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
                  <div className="lg:col-span-4 space-y-6">
                    <section className="glass-card-premium p-10 rounded-[3rem] bg-[#071A45] text-white overflow-hidden relative group border-none shadow-2xl shadow-blue-950/20">
                      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600 blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                      <div className="relative z-10 flex flex-col h-full space-y-12">
                        <div>
                          <h2 className="text-4xl font-black mb-4 leading-none uppercase tracking-tighter italic">Actions.<br/>Flash</h2>
                          <p className="text-xs font-medium text-blue-200/60 leading-relaxed max-w-[200px]">Commandes prioritaires pour la gestion de votre agence.</p>
                        </div>
                        
                        <div className="space-y-3 mt-auto">
                          {[
                            { icon: <Plus size={18} />, label: "Nouveau Bail", sub: "Générer un contrat écrit ou BDQ", color: "bg-white/10" },
                            { icon: <Camera size={18} />, label: "Nouvel EDL", sub: "Entrée / Sortie photos certifiées", color: "bg-teal-500/20" },
                            { icon: <Signature size={18} />, label: "Signatures", sub: "Envoyer un document via M-SIGN", color: "bg-orange-500/20" },
                          ].map((a, i) => (
                            <button key={i} className={`w-full flex items-center justify-between p-6 ${a.color} hover:bg-white/20 rounded-3xl transition-all group/link border border-white/5 active:scale-[0.98]`}>
                               <div className="flex items-center gap-4 text-left">
                                  <div className="p-2 bg-white/10 rounded-xl">{a.icon}</div>
                                  <div>
                                     <div className="text-[12px] font-black uppercase tracking-widest">{a.label}</div>
                                     <div className="text-[10px] text-white/40">{a.sub}</div>
                                  </div>
                               </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                    
                    <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 shadow-xl shadow-indigo-100/50">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                             <TrendingUp size={24} />
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Abonnement</div>
                             <div className="text-lg font-black text-indigo-900 leading-none">Agence Premium</div>
                          </div>
                       </div>
                       <p className="text-[11px] font-medium text-indigo-700/60 mb-6 font-mono leading-relaxed">
                          PROCHAINE ÉCHÉANCE :<br/>
                          20 MARS 2027 · 30 000 FCFA/AN
                       </p>
                       <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-300 transition-all active:scale-95">
                          Gérer mon abonnement
                       </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 flex flex-col gap-10">
                     <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Vue d'ensemble du Portefeuille</span>
                        </div>
                        <AgencyPropertyList />
                     </section>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'biens' && <AgencyPropertyList />}
            {activeTab === 'candidats' && <AgencyCandidateList />}
            {activeTab === 'outils' && <AgencyToolsGrid />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Wizard */}
      <button className="fixed bottom-24 right-8 w-16 h-16 bg-[#1F4E79] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition-all z-40 group">
         <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Alert Banner */}
      <div className="fixed bottom-36 left-8 right-8 md:left-auto md:w-[320px] glass-panel p-6 rounded-3xl border-orange-200/60 z-30 shadow-2xl animate-in slide-in-from-right duration-500">
         <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
               <ShieldCheck size={20} />
            </div>
            <div className="flex-1">
               <div className="text-[12px] font-black text-[#1F4E79] uppercase tracking-widest mb-1">Alerte Gestion</div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed mb-3">
                  1 lot en situation d'impayé critique (J+12). Relance automatique M07 programmée.
               </p>
               <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Intervenir →</button>
            </div>
         </div>
      </div>
    </div>
  );
};
