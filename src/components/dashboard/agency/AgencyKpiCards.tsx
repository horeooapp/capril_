import React from 'react';
import Link from 'next/link';
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
      value: `${fmt(totalLoyers)} F`,
      sub: "Avril 2026",
      color: "var(--ci-bleu)",
      bg: "rgba(100, 150, 200, 0.1)",
      href: "/dashboard/wallet"
    },
    {
      icon: "✅",
      label: "Encaissé",
      value: `${fmt(encaisse)} F`,
      sub: totalLoyers > 0 ? `${Math.round((encaisse / totalLoyers) * 100)}% du parc` : "0% du parc",
      color: "var(--ci-vert)",
      bg: "rgba(10, 255, 100, 0.1)",
      href: "/dashboard/receipts"
    },
    {
      icon: "⚠️",
      label: "Impayés",
      value: `${activeLeases.filter(l => l.status === 'OVERDUE').length} bien(s)`,
      sub: "Procédure Recouvrement",
      color: "var(--ci-orange)",
      bg: "rgba(255, 120, 0, 0.1)",
      href: "/dashboard/rcl-monitor"
    },
    {
      icon: "🏠",
      label: "Portefeuille",
      value: `${totalBiens} biens`,
      sub: `${vacants} vacant${vacants > 1 ? "s" : ""}`,
      color: "var(--ci-purple)",
      bg: "rgba(180, 100, 255, 0.1)",
      href: "/dashboard/properties"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((k, i) => (
        <Link key={i} href={k.href}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card group cursor-pointer block h-full flex flex-col justify-between items-start text-left"
            style={{ 
               borderLeft: `4px solid ${k.color}`, 
               background: `linear-gradient(to right, ${k.bg}, transparent)`
            }}
          >
            <div className="w-full flex justify-between items-start mb-6">
              <div className="text-3xl group-hover:scale-110 group-hover:drop-shadow-lg transition-transform duration-500">{k.icon}</div>
              <div 
                className="text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border"
                style={{ backgroundColor: `${k.color}10`, color: k.color, borderColor: `${k.color}20` }}
              >
                {k.sub}
              </div>
            </div>
            <div>
              <div 
                className="text-2xl font-black mb-1 font-mono tracking-tight"
                style={{ color: k.color }}
              >
                {k.value}
              </div>
              <div 
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500"
              >
                {k.label}
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};
