import React from 'react';
import { T, candidats } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const fmt = (v: number) => v.toLocaleString();

export const AgencyCandidateList: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Candidatures.</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi des dossiers M-CAND</p>
        </div>
        <button className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">
          Nouvelle Candidature
        </button>
      </div>

      <div className="space-y-3">
        {candidats.map((c, i) => {
          const scoreColor = c.score >= 750 ? T.green : c.score >= 600 ? T.orange : T.red;
          const scoreVisible = c.autorisation === "accordée";
          
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                        {c.nom}
                      </span>
                      <Badge 
                        label={c.statut} 
                        color={c.statut === "Qualifié" ? T.green : T.orange} 
                        bg={c.statut === "Qualifié" ? T.greenPale : T.orangePale} 
                        size={8} 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium text-slate-400 leading-none">
                        {c.emploi} · {fmt(c.loyer_max)} FCFA max
                      </span>
                      <span className="text-[10px] text-slate-300">
                        {c.docs}/5 docs reçus
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center p-2 rounded-xl border border-slate-50 min-w-[60px]">
                    {scoreVisible ? (
                       <>
                        <span className="text-xl font-black tracking-tighter leading-none" style={{ color: scoreColor }}>
                          {c.score}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Score ICL</span>
                       </>
                    ) : (
                      <>
                        <span className="text-lg">🔒</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Bloqué</span>
                      </>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-all" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-emerald-900 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <ShieldCheck className="text-emerald-500" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase leading-none mb-2">Sécurité M-CAND</h3>
            <p className="text-[11px] font-medium text-emerald-700/80 leading-relaxed max-w-[280px]">
              La base de candidats est votre actif n°1. Les scores ICL sont recalculés quotidiennement selon l'historique de paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
