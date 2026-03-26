import React from 'react';
import { T, modules } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const AgencyToolsGrid: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Outils métier.</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Écosystème de rétention agence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex items-start gap-4"
          >
            <div 
                className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${m.color}10` }}
            >
              {m.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                  {m.label}
                </span>
                <Badge 
                  label={m.code} 
                  color={m.color} 
                  bg={`${m.color}15`} 
                  size={8} 
                />
              </div>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-3">
                {m.sub}
              </p>
              <div className="flex items-center justify-between">
                <Badge 
                  label={m.kpi} 
                  color={m.kpiColor} 
                  bg={`${m.kpiColor}15`} 
                  size={9} 
                />
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Activer</span>
                   <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
