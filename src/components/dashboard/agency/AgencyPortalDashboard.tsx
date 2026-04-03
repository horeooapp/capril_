import React, { useState } from 'react';
import Link from 'next/link';
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

export const AgencyPortalDashboard: React.FC<{ user: any, properties: any[], candidatures?: any[] }> = ({ user, properties, candidatures = [] }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'biens', label: 'Biens', icon: <Building2 size={18} /> },
    { id: 'candidats', label: 'Candidats', icon: <Users size={18} /> },
    { id: 'outils', label: 'Outils', icon: <Settings2 size={18} /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden institutional-gradient-bg">
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
      <div className="px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 institutional-header p-6 rounded-[2rem]">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.3em]">Module de Supervision • Agence</p>
            <h1 className="text-4xl lg:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">
              Console Agence.
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-2 border-l-2 border-[#1F4E79] pl-4 uppercase tracking-widest flex items-center gap-2">
              <span className="text-[#1F4E79] font-black">{(user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || user?.name || "Agence Sans Nom"}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-[#C55A11]">
                {user?.isCertified ? "Agréée QAPRIL" : "Certification en cours"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="px-4">
        <div className="flex gap-2 institutional-header p-2 rounded-[2rem] w-fit shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab.id
                  ? "bg-[#1F4E79] text-white shadow-xl shadow-blue-900/20"
                  : "text-gray-400 hover:text-[#1F4E79] hover:bg-white"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          <a
            href="/dashboard/manual"
            className="flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all text-[#5B21B6] hover:bg-[#5B21B6]/10"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Manuel</span>
          </a>
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
              <div className="space-y-12">
                {/* Active Alerts - MM-07 Protocol */}
                <div className="px-4">
                  <div className="premium-stat-card p-10 relative overflow-hidden group border-red-100/50">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-500 blur-[120px] opacity-5 -mr-40 -mt-40 group-hover:opacity-10 transition-opacity"></div>
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                       <ShieldCheck size={16} className="text-red-500" />
                       Interventions Prioritaires • Protocole MM-07
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {properties.flatMap(p => p.leases || [])
                        .filter(l => l.status === 'OVERDUE')
                        .map((lease, idx) => (
                          <Link 
                            key={idx}
                            href={`/dashboard/rcl-monitor?leaseId=${lease.id}`}
                            className="bg-red-50 border border-red-100/50 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-red-100/50 transition-all block"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm text-red-600">
                                🚨
                              </div>
                              <div>
                                <div className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
                                  Impayé J+12 — {lease.tenantName || "Locataire"}
                                </div>
                                <div className="text-[11px] font-bold text-red-600 italic mt-0.5">
                                  Phase de recouvrement forcée active
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-lg font-black text-red-600 font-mono">-{lease.rentAmount?.toLocaleString()} FCFA</div>
                               <div className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">Dossier #PR-0{idx+1}</div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>

                <AgencyKpiCards properties={properties} />
                <div className="px-4">
                  <div className="border-t border-slate-100 pt-8 mt-8">
                    <AgencyPropertyList properties={properties} user={user} />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'biens' && <AgencyPropertyList properties={properties} user={user} />}
            {activeTab === 'candidats' && <AgencyCandidateList candidates={candidatures} />}
            {activeTab === 'outils' && <AgencyToolsGrid />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
    </div>
  );
};
