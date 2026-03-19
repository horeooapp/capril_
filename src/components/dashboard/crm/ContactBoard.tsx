"use client"

import { useState } from "react";
import { 
  Users, Search, Filter, Mail, Phone, 
  MessageSquare, MoreHorizontal, User, 
  ChevronRight, BadgeCheck, Clock, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  kycLevel: string;
  createdAt: Date;
}

interface ContactBoardProps {
  contacts: Contact[];
}

export default function ContactBoard({ contacts }: ContactBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = (c.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/50 p-6 border border-gray-800 rounded-3xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Rechercher un contact (nom, email...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", "OWNER", "TENANT", "AGENT", "CANDIDAT"].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                roleFilter === role 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {role === "ALL" ? "Tous" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredContacts.map((contact, idx) => (
            <motion.div
              key={contact.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 group hover:border-gray-700 transition-all flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-gray-900">
                  {contact.fullName?.[0] || <User />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white truncate max-w-[150px]">{contact.fullName}</h4>
                    {contact.kycLevel === "VERIFIED" && <BadgeCheck className="w-4 h-4 text-green-500" />}
                  </div>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{contact.role}</span>
                </div>
                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-2">
                  <Clock className="w-4 h-4" />
                  <span>Contact depuis {new Date(contact.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <button className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tags Placeholder */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-bold uppercase flex items-center gap-1 border border-indigo-500/20">
                  <Tag className="w-2 h-2" /> VIP
                </span>
                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold uppercase flex items-center gap-1 border border-amber-500/20">
                  <Tag className="w-2 h-2" /> Diaspora
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredContacts.length === 0 && (
        <div className="py-20 text-center bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-3xl">
          <Users className="w-16 h-16 text-gray-800 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucun contact ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
