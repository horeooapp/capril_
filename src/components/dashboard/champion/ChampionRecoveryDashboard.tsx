'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Smartphone, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function ChampionRecoveryDashboard() {
  const [arrears, setArrears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchArrears();
  }, []);

  const fetchArrears = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/champions/recovery/list');
      const data = await res.json();
      setArrears(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscovery = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/champions/recovery/discovery', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchArrears();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRelance = async (arrearId: string, canal: 'sms' | 'wa' = 'wa') => {
    try {
      setSending(arrearId);
      const res = await fetch('/api/v1/champions/recovery/relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arrearId, canal })
      });
      if (res.ok) {
        setSuccess(arrearId);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center animate-spin mx-auto text-[#1F4E79]">
          <Zap size={32} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calcul des dossiers prioritaires...</p>
      </div>
    );
  }

  const totalUnpaid = arrears.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-12">
      
      {/* Recovery Stats Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="md:col-span-8 bg-[#1F4E79] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40 group"
        >
           <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 blur-[100px] opacity-10 -mr-20 -mt-20"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-12">
             <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-blue-300" />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/50">Objectif Recouvrement.</span>
                </div>
                <div>
                   <h1 className="text-7xl font-black tracking-tighter leading-none italic uppercase">
                     {totalUnpaid.toLocaleString()} <span className="text-2xl font-normal opacity-50 not-italic">FCFA</span>
                   </h1>
                   <p className="text-[14px] font-black text-blue-200/60 uppercase tracking-widest mt-4">
                     {arrears.length} Dossiers prioritaires en attente de relance
                   </p>
                </div>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 w-full md:w-64 space-y-4">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Ma progression</p>
                   <p className="text-xs font-black">12%</p>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-400 w-[12%] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                </div>
                <p className="text-[9px] font-medium text-white/30 italic">Battez votre record du mois dernier !</p>
             </div>
           </div>
        </motion.div>

        <div className="md:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl flex flex-col justify-between h-full group hover:border-blue-100 transition-all">
              <ShieldCheck size={32} className="text-emerald-500" />
              <div className="space-y-2 mt-8">
                 <h3 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Mandat de Confiance.</h3>
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   En tant que Champion, vos relances humanisées augmentent le taux de recouvrement de <span className="text-[#1F4E79] font-black underline underline-offset-4 decoration-blue-200">24% en moyenne</span>.
                 </p>
              </div>
           </div>
           <div className="bg-gray-900 rounded-[3rem] p-8 text-white relative overflow-hidden h-full group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                 <Calendar size={28} className="text-blue-400" />
                 <div className="mt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Dernier succès</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter">Il y a 2 heures</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Unpaid List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
             <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Dossiers à Relancer.</h2>
             <div className="flex items-center gap-2 mt-2">
                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Relances manuelles Champion</span>
                <span className="h-[2px] w-12 bg-blue-100"></span>
             </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="Rechercher un locataire..." 
                    className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
                 />
              </div>
              <button 
                 onClick={handleDiscovery}
                 className="flex items-center gap-2 px-6 py-4 bg-[#1F4E79] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
              >
                <Zap size={16} />
                <span>Lancer la prospection</span>
              </button>
              <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#1F4E79] hover:bg-gray-50 transition-all shadow-sm">
                <Filter size={20} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {arrears.length === 0 ? (
             <div className="p-32 text-center bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
                <CheckCircle2 size={64} className="mx-auto text-emerald-100 mb-6" />
                <p className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] italic">Tous les comptes sont à jour !</p>
                <p className="text-xs text-gray-300 font-medium mt-2">Revenez plus tard pour de nouvelles opportunités.</p>
             </div>
           ) : (
             arrears.map((item) => (
               <motion.div 
                 key={item.id}
                 layoutId={item.id}
                 className="bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all group"
               >
                 <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                        👤
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-50 text-[10px] font-black text-[#1F4E79]">
                        {item.lease.property.propertyCode.substring(0,2)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">{(item.lease.tenant.firstName ? item.lease.tenant.firstName + " " : "") + (item.lease.tenant.lastName || "")}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Smartphone size={12} className="text-blue-500" /> {item.lease.tenant.phone}
                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                        {item.lease.property.address}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100/50">
                           Retard {Math.floor((new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 3600 * 24))} Jours
                         </span>
                         <span className="text-xs font-bold text-gray-400 italic">Bailleur: {(item.lease.landlord.firstName ? item.lease.landlord.firstName + " " : "") + (item.lease.landlord.lastName || "")}</span>
                      </div>
                    </div>
                 </div>

                 <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                    <p className="text-3xl font-black text-[#1F4E79] tracking-tighter italic">
                       {item.amount.toLocaleString()} <span className="text-sm font-normal opacity-40">FCFA</span>
                    </p>
                    <div className="flex items-center gap-3 w-full">
                       <button 
                          disabled={sending === item.id || success === item.id}
                          onClick={() => handleRelance(item.id, 'wa')}
                          className={`flex-1 md:w-48 py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${
                             success === item.id 
                             ? 'bg-emerald-500 text-white shadow-emerald-900/20' 
                             : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-green-900/20 active:scale-95'
                          } disabled:opacity-50`}
                       >
                         {sending === item.id ? (
                           <Zap size={18} className="animate-pulse" />
                         ) : success === item.id ? (
                           <CheckCircle2 size={18} />
                         ) : (
                           <>
                             <MessageSquare size={16} /> WhatsApp
                           </>
                         )}
                       </button>
                       <button 
                          disabled={sending === item.id || success === item.id}
                          onClick={() => handleRelance(item.id, 'sms')}
                          className="p-5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-[1.5rem] transition-all active:scale-90"
                       >
                         <Smartphone size={18} />
                       </button>
                    </div>
                 </div>
               </motion.div>
             ))
           )}
        </div>
      </div>

    </div>
  );
}
