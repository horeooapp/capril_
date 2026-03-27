"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  History, 
  UserCheck, 
  XCircle, 
  Clock, 
  ChevronRight,
  QrCode,
  Info
} from 'lucide-react';
import { Badge } from '../agency/Badge';

const mockAccessLogs = [
  { id: 1, entity: "Agence Akwaba Immobilière", date: "2026-03-22 14:15", action: "Visualisation Score", status: "authorized" },
  { id: 2, entity: "M. Bakayoko (Bailleur)", date: "2026-03-20 09:30", action: "Demande de Dossier", status: "expired" },
  { id: 3, entity: "Groupe Convergence", date: "2026-03-18 16:45", action: "Audit ICL", status: "revoked" },
  { id: 4, entity: "Cabinet Conseil QAPRIL", date: "2026-03-01 11:00", action: "Certification Annuelle", status: "authorized" }
];

export const TrustHistory: React.FC<{ score: number }> = ({ score }) => {
  const [logs, setLogs] = useState(mockAccessLogs);

  const revokeAccess = (id: number) => {
    setLogs(logs.map(l => l.id === id ? { ...l, status: 'revoked' } : l));
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Transparence & ICL.</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C55A11] mt-1">Audit de consultation de vos données (Rule 3.9)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Score & QR */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#1F4E79]"></div>
              <div className="mb-6 flex justify-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center p-4 shadow-inner">
                    <QrCode size={48} className="text-[#1F4E79]" />
                 </div>
              </div>
              <h3 className="text-sm font-black text-[#1F4E79] uppercase tracking-widest mb-2">Mon Passeport Digital</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">
                 Présentez ce code aux agences pour un accès temporaire (24h) à votre score certifié.
              </p>
              <button className="w-full py-4 bg-[#1F4E79] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg shadow-blue-900/20">
                 Générer un jeton d'accès
              </button>
           </div>

           <div className="bg-[#1F4E79] p-8 rounded-[3rem] shadow-xl text-white">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">Pondération ICL 2026</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                       <span>Ponctualité</span>
                       <span className="text-emerald-400">600 Pts</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-emerald-400" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                       <span>Stabilité</span>
                       <span className="text-blue-400">200 Pts</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} className="h-full bg-blue-400" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                       <span>KYC / Dossier</span>
                       <span className="text-orange-400">200 Pts</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-orange-400" />
                    </div>
                 </div>
              </div>
              <p className="text-[10px] font-medium text-white/40 mt-8 italic leading-relaxed">
                 Votre score est calculé selon la règle des 600/200/200 certifiée par le cabinet QAPRIL Technologies SA.
              </p>
           </div>
        </div>

        {/* Right: Audit Log */}
        <div className="lg:col-span-8">
           <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1F4E79]">
                       <History size={20} />
                    </div>
                    <h3 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase italic leading-none">Journal des Consultations.</h3>
                 </div>
                 <Badge label={`${logs.length} Activités`} color="#1F4E79" bg="#F0F4F8" size={10} />
              </div>

              <div className="space-y-4">
                 <AnimatePresence>
                    {logs.map((log) => (
                       <motion.div 
                         key={log.id}
                         layout
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                               log.status === 'revoked' ? 'bg-red-50 text-red-300' : 'bg-white text-[#1F4E79]'
                             }`}>
                                {log.status === 'revoked' ? <Lock size={20} /> : <Eye size={20} />}
                             </div>
                             <div>
                                <div className="text-[14px] font-black text-[#1F4E79] uppercase tracking-tight">{log.entity}</div>
                                <div className="flex items-center gap-3 mt-1">
                                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                      <Clock size={12} />
                                      {log.date}
                                   </div>
                                   <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">• {log.action}</div>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4">
                             {log.status === 'authorized' && (
                                <button 
                                  onClick={() => revokeAccess(log.id)}
                                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                   Révoquer
                                </button>
                             )}
                             {log.status === 'revoked' && (
                                <div className="flex items-center gap-1 text-red-500">
                                   <XCircle size={14} />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Accès révoqué</span>
                                </div>
                             )}
                             {log.status === 'expired' && (
                                <div className="flex items-center gap-1 text-slate-400">
                                   <Clock size={14} />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Expiré</span>
                                </div>
                             )}
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>

              <div className="mt-12 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                    <ShieldCheck size={28} />
                 </div>
                 <div>
                    <h4 className="text-[15px] font-black text-emerald-900 uppercase tracking-tight italic">Votre protection est notre priorité.</h4>
                    <p className="text-[12px] font-medium text-emerald-800/70 leading-relaxed mt-1">
                       QAPRIL utilise un protocole de chiffrement à double clé pour vos données ICL. Aucune agence ne peut consulter votre score sans votre consentement explicite via SMS ou QR Code.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
