"use client"

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
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      {/* Header Contextuel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="relative">
          <motion.div 
            initial={{ width: 0 }} animate={{ width: "100%" }}
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-indigo-600 to-transparent" 
          />
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-indigo-500" />
            AGENCY <span className="text-indigo-500 italic">CORE</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2 ml-1">Système de pilotage QAPRIL v3.0</p>
        </div>

        <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-2xl border border-gray-800 backdrop-blur-md">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                A{i}
              </div>
            ))}
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <span className="text-xs font-black text-indigo-500">4 Collaborateurs</span>
          </div>
          <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800 w-fit mb-10 shadow-inner overflow-x-auto max-w-full no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
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
          <div className="absolute inset-0 flex items-center justify-center font-black tracking-widest text-indigo-500/20 animate-pulse text-4xl">
            LOADING ASSETS...
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
      <div className="mt-12 flex justify-between items-center border-t border-gray-800 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temps réel certifié par QAPRIL Gateway</span>
        </div>
        <div className="text-[10px] font-mono text-gray-500 uppercase">SESSION_ID: PROD-{new Date().getFullYear()}-CORE</div>
      </div>
    </div>
  );
}
