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
      label: "CA TOTAL ESTIMÉ",
      value: `${fmt(totalLoyers)} FCFA`,
      sub: "Loyer théorique mensuel",
      icon: <DollarSign size={20} />,
      color: T.navy,
      bg: T.navyPale,
    },
    {
      label: "ENCAISSÉ (MÉDIAN)",
      value: `${fmt(encaisse)} FCFA`,
      sub: totalLoyers > 0 ? `${Math.round((encaisse / totalLoyers) * 100)}% du CA théorique` : "0% du CA théorique",
      icon: <TrendingUp size={20} />,
      color: T.green,
      bg: T.greenPale,
    },
    {
      label: "IMPAYÉS / RETARD",
      value: `${fmt(impayes)} FCFA`,
      sub: impayes > 0 ? "Lots en situation de retard" : "Aucun retard détecté",
      icon: <ShieldAlert size={20} />,
      color: T.red,
      bg: T.redPale,
    },
    {
      label: "VACANCE LOCATIVE",
      value: `${txVacance}%`,
      sub: `${vacants} bien(s) sans locataire`,
      icon: <Home size={20} />,
      color: T.orange,
      bg: T.orangePale,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-2xl border"
          style={{ backgroundColor: s.bg, borderColor: `${s.color}20` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase opacity-50" style={{ color: s.color }}>
              {s.label}
            </span>
          </div>
          <div>
            <div className="text-xl font-black tracking-tighter" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] font-medium opacity-70 mt-1" style={{ color: s.color }}>
              {s.sub}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
