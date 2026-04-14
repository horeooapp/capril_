import React from 'react';
import { modules } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const AgencyToolsGrid: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Outils métier.</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Écosystème de rétention agence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m, i) => {
          const Content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-[2rem] hover:border-[var(--ci-or)]/30 cursor-pointer group flex flex-col justify-between h-full transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div 
                    className="w-14 h-14 flex items-center justify-center rounded-2xl text-3xl flex-shrink-0 transition-transform group-hover:scale-110 border border-[var(--ci-nuit3)]"
                    style={{ backgroundColor: `${m.color}10`, color: m.color }}
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
                  <span className="text-[15px] font-black text-white uppercase tracking-tighter leading-none">
                    {m.label}
                  </span>
                  <Badge 
                    label={m.code} 
                    color={m.color} 
                    bg={`${m.color}10`} 
                    size={8} 
                  />
                </div>
                <p className="text-[11px] font-medium text-gray-400 leading-relaxed mb-6">
                  {m.sub}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--ci-nuit3)]">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-[var(--ci-or)] transition-colors">Démarrer le module</span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-[var(--ci-or)] transition-colors group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          );

          const getHref = (code: string) => {
            switch (code) {
              case 'M-EDL': return "/dashboard/edl-comparator";
              case 'M-SIGN': return "/dashboard/lease-wizard";
              case 'M-RCL': return "/dashboard/rcl-monitor";
              case 'M-MAINT': return "/dashboard/maintenance";
              case 'M-CHARGES': return "/dashboard/receipts";
              case 'M-COMPTA': return "/dashboard/receipts";
              case 'M-AGENDA': return "/dashboard/agenda";
              case 'M-ANNONCES': return "/dashboard/properties";
              default: return "#";
            }
          };

          return (
            <Link key={i} href={getHref(m.code)}>
              {Content}
            </Link>
          );
        })}
      </div>

      <div className="panel bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-[2rem] p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-black text-white tracking-widest uppercase italic">Lock-in Cumulative</h3>
           <span className="text-[10px] font-black text-[var(--ci-bleu)] uppercase tracking-widest">87 / 100</span>
        </div>
        <div className="h-2 bg-[var(--ci-nuit3)] rounded-full overflow-hidden mb-3 shadow-inner">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "87%" }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="h-full bg-gradient-to-r from-[var(--ci-bleu)] to-[var(--ci-vert)]"
           />
        </div>
        <p className="text-[10px] font-medium text-gray-400 italic">
          Indice de dépendance technologique élevé. Coût de transition estimé à 12 mois de restructuration.
        </p>
      </div>
    </div>
  );
};
