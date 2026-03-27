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
          const scoreColor = (c.score || 0) >= 850 ? T.gold : (c.score || 0) >= 750 ? T.green : T.orange;
          const scoreVisible = c.autorisation === "accordée";
          
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[16px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                        {c.nom}
                      </span>
                      {scoreVisible && <Badge label={`✓ Autorisé ${c.autoDate}`} color={T.green} bg={T.greenPale} size={8} />}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[12px] font-black text-slate-400 leading-none">
                        {c.emploi}
                      </span>
                      <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">
                        MAX {fmt(c.loyerMax)} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {c.autorisation === "accordée" ? (
                    <div className="flex flex-col items-end pr-6 border-r border-slate-100">
                      <span className="text-3xl font-black tracking-tighter leading-none font-mono" style={{ color: scoreColor }}>
                        {c.score}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Score ICL Certifié</span>
                    </div>
                  ) : c.autorisation === "demande_envoyée" ? (
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end pr-6 border-r border-slate-100 text-amber-500">
                        <span className="text-lg">⏳</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1">En attente</span>
                      </div>
                      <Badge label="SMS Envoyé" color={T.orange} bg={T.orangePale} size={8} />
                    </div>
                  ) : c.autorisation === "refusée" ? (
                    <div className="flex flex-col items-end pr-6 border-r border-slate-100 text-rose-500">
                      <span className="text-lg">✕</span>
                      <span className="text-[9px] font-black uppercase tracking-widest mt-1">Accès Refusé</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-end pr-6 border-r border-slate-100 text-slate-300">
                        <span className="text-2xl">🔒</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1">Données Protégées</span>
                      </div>
                      <button className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-colors border border-teal-100">
                        Demander accès
                      </button>
                    </div>
                  )}
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-900 transition-all group-hover:translate-x-1" />
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
