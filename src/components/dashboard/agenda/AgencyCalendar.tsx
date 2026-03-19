"use client"

import { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, User, Phone, Briefcase, Plus, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  typeEvent: string;
  titre: string;
  debutAt: Date;
  finAt?: Date;
  contact?: { fullName: string | null; phone: string | null };
  logement?: { address: string };
  statut: string;
}

interface AgencyCalendarProps {
  initialEvents: Event[];
  onAddEvent?: () => void;
}

export default function AgencyCalendar({ initialEvents, onAddEvent }: AgencyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Group events by day
  const eventsByDay = initialEvents.reduce((acc, event) => {
    const day = new Date(event.debutAt).getDate();
    const month = new Date(event.debutAt).getMonth();
    const year = new Date(event.debutAt).getFullYear();
    
    if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
    }
    return acc;
  }, {} as Record<number, Event[]>);

  const selectedDayEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full min-h-[600px]">
      {/* Calendar Grid */}
      <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Calendar Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/10 rounded-2xl">
              <CalendarIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {monthNames[currentDate.getMonth()]} <span className="text-indigo-500">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase">Vue Mensuelle</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold uppercase">{initialEvents.length} Événements</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={prevMonth} className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"><ChevronLeft /></button>
            <button onClick={nextMonth} className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"><ChevronRight /></button>
            <button 
              onClick={onAddEvent}
              className="ml-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-5 h-5" /> Planifier
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-900/40">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{d}</div>
          ))}
        </div>

        {/* The Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-950/20">
          {blanks.map(b => <div key={`b-${b}`} className="border-r border-b border-gray-800/50 opacity-20" />)}
          {days.map(d => {
            const hasEvents = eventsByDay[d]?.length > 0;
            const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
            const isSelected = d === selectedDay;

            return (
              <div 
                key={d} 
                onClick={() => setSelectedDay(d)}
                className={`min-h-[100px] border-r border-b border-gray-800/50 p-3 transition-all cursor-pointer relative group ${
                  isSelected ? 'bg-indigo-500/5' : 'hover:bg-gray-800/30'
                }`}
              >
                <span className={`text-sm font-bold transition-all px-2 py-1 rounded-lg ${
                  isToday ? 'bg-indigo-600 text-white' : 
                  isSelected ? 'text-indigo-500' : 'text-gray-600'
                }`}>
                  {d}
                </span>

                {hasEvents && (
                  <div className="mt-2 space-y-1">
                    {eventsByDay[d].slice(0, 2).map((e, idx) => (
                      <div key={idx} className="text-[9px] px-2 py-1 rounded bg-gray-800 text-gray-300 font-bold truncate border-l-2 border-indigo-500">
                        {e.titre}
                      </div>
                    ))}
                    {eventsByDay[d].length > 2 && (
                      <div className="text-[9px] text-gray-500 font-black pl-2">+{eventsByDay[d].length - 2} autres</div>
                    )}
                  </div>
                )}
                
                {isSelected && <motion.div layoutId="selection" className="absolute inset-0 border-2 border-indigo-500/20 pointer-events-none" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar - Daily Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Agenda du {selectedDay} {monthNames[currentDate.getMonth()]}
        </h3>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedDayEvents.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun événement prévu.</p>
                <button 
                  onClick={onAddEvent}
                  className="mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest"
                >
                  Planifier quelque chose
                </button>
              </motion.div>
            ) : (
              selectedDayEvents.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 bg-gray-800/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                      {event.typeEvent}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(event.debutAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-3 leading-tight">{event.titre}</h4>
                  
                  <div className="space-y-2">
                    {event.contact && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <User className="w-3 h-3 text-indigo-500" />
                        <span className="truncate">{event.contact.fullName}</span>
                      </div>
                    )}
                    {event.logement && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="truncate">{event.logement.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase">Modifier</button>
                    <button className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase">Annuler</button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
