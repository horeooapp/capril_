"use client"

import { useState } from "react";
import { 
  Wrench, CheckCircle2, Clock, AlertTriangle, 
  MessageSquare, MoreVertical, MapPin, 
  ChevronRight, Filter, Search 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateTicketStatus } from "@/actions/maintenance-actions";

interface Ticket {
  id: string;
  titre: string;
  description: string;
  statut: string;
  createdAt: Date;
  declarant: { fullName: string | null };
  logement: { address: string };
}

export default function MaintenanceAgencyDash({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === "ALL" || t.statut === filter;
    const matchesSearch = t.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.logement.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "SIGNALE": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "TRAVAUX_EN_COURS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "RESOLU": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-800 text-gray-400";
    }
  };

  const handleUpdateStatus = async (id: string, newStatut: string) => {
    const res = await updateTicketStatus(id, newStatut);
    if (res.success) {
      setTickets(tickets.map(t => t.id === id ? { ...t, statut: newStatut } : t));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/50 p-6 border border-gray-800 rounded-3xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Rechercher par adresse ou titre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", "SIGNALE", "TRAVAUX_EN_COURS", "RESOLU"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === s 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s === "ALL" ? "Tous" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTickets.map((ticket, idx) => (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 group hover:border-gray-700 transition-all flex flex-col md:flex-row items-center gap-6"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${ticket.statut === "RESOLU" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <Wrench className={`w-8 h-8 ${ticket.statut === "RESOLU" ? "text-green-500" : "text-red-500"}`} />
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border-l-4 ${getStatusColor(ticket.statut)}`}>
                    {ticket.statut.replace(/_/g, " ")}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">• Modifié le {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1 truncate">{ticket.titre}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{ticket.logement.address}</span>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-center px-8 border-x border-gray-800">
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Locataire</span>
                <span className="text-white font-bold">{ticket.declarant.fullName || "Anonyme"}</span>
              </div>

              <div className="flex gap-2">
                {ticket.statut === "SIGNALE" && (
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, "TRAVAUX_EN_COURS")}
                      className="px-4 py-3 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Lancer Travaux
                    </button>
                )}
                {ticket.statut === "TRAVAUX_EN_COURS" && (
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id, "RESOLU")}
                      className="px-4 py-3 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Clôturer
                    </button>
                )}
                <button className="p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTickets.length === 0 && (
        <div className="py-20 text-center bg-gray-900 border border-gray-800 rounded-3xl border-dashed">
          <CheckCircle2 className="w-16 h-16 text-gray-800 mx-auto mb-4" />
          <p className="text-gray-500 font-medium tracking-tight">Aucun ticket en attente dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}
