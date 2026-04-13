"use client"
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { 
  Calendar, Users, BarChart3, Briefcase, 
  Settings2, Bell, Search, ShieldCheck, DollarSign 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AgencyCalendar from "@/components/dashboard/agenda/AgencyCalendar";
import ContactBoard from "@/components/dashboard/crm/ContactBoard";
import AgencyKpiDash from "@/components/dashboard/agency/AgencyKpiDash";
import MaintenanceAgencyDash from "@/components/dashboard/maintenance/MaintenanceAgencyDash";
import CandidatManager from "@/components/dashboard/candidat/CandidatManager";
import ChargesManager from "@/components/dashboard/financial/ChargesManager";
import LandlordStatement from "@/components/dashboard/financial/LandlordStatement";
import { getAgencyEvents } from "@/actions/agenda-actions";
import { getCrmContacts } from "@/actions/crm-actions";
import { getPropertyTickets } from "@/actions/maintenance-actions";
import { getPropertyCandidatures } from "@/actions/candidature-actions";
import { getAgencyKpis, getMyAgencyId } from "@/actions/agency-actions";

export default function AgencyDashboardPage() {
  const [activeTab, setActiveTab] = useState<"PLANNING" | "CRM" | "KPI" | "MAINT" | "CAND">("PLANNING");
  const [events, setEvents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const agencyId = await getMyAgencyId() || "current-agency";
      
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const end = new Date();
      end.setMonth(end.getMonth() + 2);

      const [eventsRes, contactsRes, ticketsRes, candidaturesRes, kpisRes] = await Promise.all([
        getAgencyEvents(agencyId, start, end),
        getCrmContacts(agencyId),
        getPropertyTickets("all"),
        getPropertyCandidatures("all"),
        getAgencyKpis(agencyId)
      ]);

      setEvents(eventsRes);
      setContacts(contactsRes);
      setMaintenanceTickets(ticketsRes);
      setCandidatures(candidaturesRes);
      setKpiData(kpisRes);
      setLoading(false);
    }
    loadData();
  }, []);

  const tabs = [
    { id: "PLANNING", label: "Agenda & Planning", icon: <Calendar className="w-4 h-4" /> },
    { id: "CRM", label: "CRM Contacts", icon: <Users className="w-4 h-4" /> },
    { id: "MAINT", label: "Maintenance", icon: <Settings2 className="w-4 h-4" /> },
    { id: "CAND", label: "Candidatures", icon: <Briefcase className="w-4 h-4" /> },
    { id: "KPI", label: "Performance", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-12 pb-16 relative">
      <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

      {/* Header Contextuel */}
      <div className="page-header flex-col md:flex-row items-start md:items-center">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#C55A11]" />
            AGENCY <span className="text-[#C55A11] italic">CORE</span>
          </h1>
          <p className="page-sub">Vigilance et pilotage des flux agences - Hub National</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-[var(--ci-nuit2)] border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                A{i}
              </div>
            ))}
          </div>
          <div className="p-3 bg-[rgba(255,102,0,0.1)] rounded-xl">
            <span className="text-xs font-black text-[#FF6600]">4 Collaborateurs</span>
          </div>
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all relative text-white" onClick={(e) => { e.preventDefault(); toast.success('Lectures mises à jour : Aucune alerte urgente.') }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-[rgba(255,102,0,0.2)] w-fit shadow-inner overflow-x-auto max-w-full no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-[var(--ci-orange)] text-white shadow-lg shadow-[rgba(255,102,0,0.4)]" 
                : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative min-h-[600px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center font-black tracking-widest text-[#FF6600]/20 animate-pulse text-4xl">
            SYNCHRONISATION CORE...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Note: Components inside here might still have some white bg that we will strip incrementally if needed. */}
              {activeTab === "PLANNING" && <AgencyCalendar initialEvents={events} />}
              {activeTab === "CRM" && <ContactBoard contacts={contacts} />}
              {activeTab === "MAINT" && <MaintenanceAgencyDash initialTickets={maintenanceTickets} />}
              {activeTab === "CAND" && <CandidatManager initialCandidatures={candidatures} loyerLoyer={350000} />}
              {activeTab === "KPI" && kpiData && <AgencyKpiDash data={kpiData} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex justify-between items-center border-t border-white/5 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all mt-12">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-5 h-5 text-[var(--ci-vert)]" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Architecture Sécurisée - Nuit V2</span>
        </div>
        <div className="text-[10px] font-mono text-gray-600 uppercase">SESSION_ID: PROD-{new Date().getFullYear()}-CORE</div>
      </div>
    </div>
  );
}
