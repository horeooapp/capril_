import React from 'react';
import { T, biens } from '@/constants/agency-data';
import { TrendingUp, ShieldAlert, Home, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const fmt = (v: number) => v.toLocaleString();

export const AgencyKpiCards: React.FC<{ properties: any[] }> = ({ properties }) => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Calculate live stats
  const activeLeases = properties.flatMap(p => p.leases || []).filter(l => l.status === 'ACTIVE');
  const totalLoyers = activeLeases.reduce((acc, l) => acc + (l.rentAmount || 0), 0);
  
  // Total collected for current month
  const encaisse = activeLeases.reduce((acc, l) => {
    const monthReceipts = (l.receipts || []).filter((r: any) => r.periodMonth === currentMonthYear && r.status === 'paid');
    const collectedForLease = monthReceipts.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
    return acc + collectedForLease;
  }, 0);

  const vacants = properties.filter(p => !p.leases || p.leases.length === 0 || p.leases.every((l: any) => l.status !== 'ACTIVE')).length;
  const totalBiens = properties.length;
  const txVacance = totalBiens > 0 ? Math.round((vacants / totalBiens) * 100) : 0;
  
  const impayes = totalLoyers - encaisse > 0 ? totalLoyers - encaisse : 0;

  const stats = [
    {
      icon: "💰",
      label: "Loyers théoriques",
      value: `${fmt(totalLoyers)} FCFA`,
      sub: "Avril 2026",
      color: T.navy,
      bg: T.navyPale,
    },
    {
      icon: "✅",
      label: "Encaissé",
      value: `${fmt(encaisse)} FCFA`,
      sub: totalLoyers > 0 ? `${Math.round((encaisse / totalLoyers) * 100)}% du portefeuille` : "0% du portefeuille",
      color: T.green,
      bg: T.greenPale,
    },
    {
      icon: "⚠️",
      label: "Impayés",
      value: `${activeLeases.filter(l => l.status === 'OVERDUE').length} bien(s)`,
      sub: "Procédure M07 active",
      color: T.red,
      bg: T.redPale,
    },
    {
      icon: "🏠",
      label: "Portefeuille",
      value: `${totalBiens} biens`,
      sub: `${vacants} vacant${vacants > 1 ? "s" : ""}`,
      color: T.teal,
      bg: T.tealPale,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
      {stats.map((k, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-premium p-8 group overflow-hidden border-t-4"
          style={{ borderTopColor: k.color }}
        >
          <div className="flex justify-between items-start mb-10">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-500">{k.icon}</div>
            <div 
              className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border"
              style={{ backgroundColor: `${k.color}10`, color: k.color, borderColor: `${k.color}20` }}
            >
              {k.sub}
            </div>
          </div>
          <div>
            <div 
              className="text-3xl font-black mb-2 tracking-tighter leading-none"
              style={{ color: k.color }}
            >
              {k.value}
            </div>
            <div 
              className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70"
              style={{ color: k.color }}
            >
              {k.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
