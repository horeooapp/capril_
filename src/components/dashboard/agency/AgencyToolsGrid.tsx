import React from 'react';
import { T, modules } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const AgencyToolsGrid: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Outils métier.</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Écosystème de rétention agence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m, i) => {
          const Content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer group flex flex-col justify-between h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div 
                    className="w-14 h-14 flex items-center justify-center rounded-2xl text-3xl flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: m.bg }}
                >
                  {m.icon}
                </div>
                <Badge 
                  label={m.kpi} 
                  color={m.color} 
                  bg={`${m.color}15`} 
                  size={10} 
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[15px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                    {m.label}
                  </span>
                  <Badge 
                    label={m.code} 
                    color={m.color} 
                    bg={`${m.color}10`} 
                    size={8} 
                  />
                </div>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6">
                  {m.sub}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Démarrer le module</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          );

          if (m.code === 'M-EDL') {
            return (
              <Link key={i} href="/dashboard/edl-comparator">
                {Content}
              </Link>
            );
          }

          if (m.code === 'M-SIGN') {
            return (
              <Link key={i} href="/dashboard/lease-wizard">
                {Content}
              </Link>
            );
          }

          if (m.code === 'M-RCL') {
            return (
              <Link key={i} href="/dashboard/rcl-monitor">
                {Content}
              </Link>
            );
          }

          return <div key={i}>{Content}</div>;
        })}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase italic">Lock-in Cumulative</h3>
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">87 / 100</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3 shadow-inner">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "87%" }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="h-full bg-gradient-to-r from-indigo-500 to-blue-600"
           />
        </div>
        <p className="text-[10px] font-medium text-slate-400 italic">
          Indice de dépendance technologique élevé. Coût de transition estimé à 12 mois de restructuration.
        </p>
      </div>
    </div>
  );
};
