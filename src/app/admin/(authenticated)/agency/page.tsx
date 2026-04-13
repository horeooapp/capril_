"use client"
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Calendar, Users, BarChart3, Briefcase, 
  Settings2, Bell, Search, ShieldCheck, DollarSign, Activity
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
    <div className="space-y-8 pb-16 relative">
      <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

      {/* Header Contextuel */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-[var(--ci-vert)]" />
            AGENCY CORE
          </h1>
          <p className="page-sub">Pilotez votre gestion courante, de la prospection à la maintenance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="date-badge">
            <Activity className="w-4 h-4" />
            PROD-{new Date().getFullYear()}-CORE
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mb-10 shadow-inner overflow-x-auto max-w-full no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-[var(--ci-orange)] text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
          <div className="absolute inset-0 flex items-center justify-center font-black tracking-widest text-white/10 animate-pulse text-4xl font-mono">
            CHARGEMENT ASSETS...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              {activeTab === "PLANNING" && (
                <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 shadow-none">
                  <AgencyCalendar initialEvents={events} />
                </div>
              )}
              {activeTab === "CRM" && (
                <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 shadow-none">
                  <ContactBoard contacts={contacts} />
                </div>
              )}
              {activeTab === "MAINT" && (
                <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 shadow-none">
                  <MaintenanceAgencyDash initialTickets={maintenanceTickets} />
                </div>
              )}
              {activeTab === "CAND" && (
                <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 shadow-none">
                  <CandidatManager initialCandidatures={candidatures} loyerLoyer={350000} />
                </div>
              )}
              {activeTab === "KPI" && kpiData && (
                <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-orange)]/20 shadow-none p-0 overflow-hidden">
                  <AgencyKpiDash data={kpiData} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-8 opacity-50 transition-opacity hover:opacity-100">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-5 h-5 text-[var(--ci-vert)]" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Opérations protégées par QAPRIL Core</span>
        </div>
      </div>
    </div>
  );
}
