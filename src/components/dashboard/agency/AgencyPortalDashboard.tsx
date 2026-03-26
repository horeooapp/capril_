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

export const AgencyPortalDashboard: React.FC<{ user: any, properties: any[] }> = ({ user, properties }) => {
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
              <span className="text-[#1F4E79] font-black uppercase">{user?.fullName || user?.name || "Agence Sans Nom"}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[14px] font-black uppercase tracking-widest text-[#C55A11]">
                {user?.isCertified ? "Agence Agréée QAPRIL" : "Agence en cours d'agrément"}
              </span>
            </p>
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
                <AgencyKpiCards properties={properties} />
                <div className="px-4">
                     <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Vue d'ensemble du Portefeuille</span>
                        </div>
                        <AgencyPropertyList properties={properties} />
                     </section>
                </div>
              </div>
            )}
            {activeTab === 'biens' && <AgencyPropertyList properties={properties} />}
            {activeTab === 'candidats' && <AgencyCandidateList />}
            {activeTab === 'outils' && <AgencyToolsGrid />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};
