import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, Settings2, Plus, 
  TrendingUp, ShieldCheck, Bot, Zap, FileText, Camera, Signature
} from 'lucide-react';
import { AgencyKpiCards } from './AgencyKpiCards';
import { AgencyPropertyList } from './AgencyPropertyList';
import { AgencyCandidateList } from './AgencyCandidateList';
import { AgencyToolsGrid } from './AgencyToolsGrid';

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* PAGE HEADER */}
      <div className="page-header">
         <div className="ph-title-group">
            <div className="ph-label flex items-center gap-2">
               Module de Supervision • Agence 
            </div>
            <h1 className="ph-title flex items-center gap-4 flex-wrap">
               Console Agence.
               <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] border border-[var(--ci-vert)]/20 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                  {user?.isCertified ? "Agréée QAPRIL" : "Certification en cours"}
               </span>
            </h1>
            <p className="text-[12px] font-bold text-gray-400 mt-2">
               {(user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || user?.name || "Agence Sans Nom"}
            </p>
         </div>
         <div className="ph-actions">
         </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-[var(--ci-nuit3)] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
        <a
          href="/dashboard/manual"
          className="flex items-center gap-2 px-6 py-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
        >
          <FileText size={18} />
          <span className="hidden sm:inline">Manuel</span>
        </a>
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
                <div className="panel" style={{ borderLeft: "4px solid var(--ci-orange)" }}>
                    <h3 className="text-[10px] font-black text-[var(--ci-orange)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                       <ShieldCheck size={16} className="text-[var(--ci-orange)]" />
                       Interventions Prioritaires • Protocole Recouvrement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {properties.flatMap(p => p.leases || [])
                        .filter(l => l.status === 'OVERDUE')
                        .map((lease, idx) => (
                          <Link 
                            key={idx}
                            href={`/dashboard/rcl-monitor?leaseId=${lease.id}`}
                            className="bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 rounded-xl p-4 flex justify-between items-center group cursor-pointer hover:bg-[var(--ci-orange)]/10 transition-all block"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[var(--ci-orange)]/20 rounded-xl flex items-center justify-center text-xl text-[var(--ci-orange)]">
                                🚨
                              </div>
                              <div>
                                <div className="text-[12px] font-bold text-white uppercase tracking-tight">
                                  Impayé Actif — {lease.tenantName || "Locataire"}
                                </div>
                                <div className="text-[10px] font-bold text-[var(--ci-orange)] mt-0.5">
                                  Phase de recouvrement requise
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-sm font-black text-[var(--ci-orange)] font-mono">-{lease.rentAmount?.toLocaleString()} F</div>
                               <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Dossier #PR-0{idx+1}</div>
                            </div>
                          </Link>
                        ))}
                        {properties.flatMap(p => p.leases || []).filter(l => l.status === 'OVERDUE').length === 0 && (
                            <div className="text-gray-500 text-xs py-4">Aucune intervention prioritaire requise pour le moment.</div>
                        )}
                    </div>
                </div>

                <AgencyKpiCards properties={properties} />
                <div className="border-t border-[var(--ci-nuit3)] pt-8 mt-8">
                  <AgencyPropertyList properties={properties} user={user} />
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
  );
};
