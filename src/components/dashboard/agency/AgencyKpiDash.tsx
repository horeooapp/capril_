"use client"

import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Home, ShieldAlert, BarChart3, Activity 
} from "lucide-react";
import { motion } from "framer-motion";

interface KpiData {
  occupancyRate: number;
  expectedRent: number;
  collectedRent: number;
  recoveryRate: number;
  outstandingArrears: number;
  monthlyFees: number;
  leaseExpirations: number;
}

export default function AgencyKpiDash({ data }: { data: KpiData }) {
  const cards = [
    { 
      label: "Taux d'Occupation", 
      value: `${data.occupancyRate}%`, 
      icon: <Home className="text-indigo-500" />, 
      trend: "+2%", 
      trendUp: true,
      color: "indigo"
    },
    { 
      label: "Recouvrement", 
      value: `${data.recoveryRate}%`, 
      icon: <Activity className="text-green-500" />, 
      trend: "+1.5%", 
      trendUp: true,
      color: "green"
    },
    { 
      label: "Collecte (Mensuelle)", 
      value: `${data.collectedRent.toLocaleString()} FCFA`, 
      subValue: `Sur ${data.expectedRent.toLocaleString()} attendus`,
      icon: <DollarSign className="text-blue-500" />, 
      color: "blue"
    },
    { 
      label: "Arriérés Totaux", 
      value: `${data.outstandingArrears.toLocaleString()} FCFA`, 
      icon: <ShieldAlert className="text-red-500" />, 
      trend: "-5%", 
      trendUp: true,
      color: "red"
    },
    { 
      label: "Commissions Agence", 
      value: `${data.monthlyFees.toLocaleString()} FCFA`, 
      icon: <BarChart3 className="text-purple-500" />, 
      color: "purple"
    },
    { 
      label: "Baux à renouveler", 
      value: data.leaseExpirations, 
      subValue: "Sous 60 jours",
      icon: <TrendingDown className="text-orange-500" />, 
      color: "orange"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all shadow-xl"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 bg-${card.color}-500/10 rounded-2xl`}>
                {card.icon}
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                  card.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-white mb-1">{card.value}</h3>
            {card.subValue && (
              <p className="text-[10px] text-gray-400 font-medium">{card.subValue}</p>
            )}

            {/* Micro Graph placeholder */}
            <div className="mt-6 flex gap-1 items-end h-8">
              {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 bg-${card.color}-500/20 rounded-t-sm group-hover:bg-${card.color}-500/40 transition-all`} 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recovery Chart Visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-bold text-white">Performance de Recouvrement</h3>
            <p className="text-sm text-gray-500">Comparaison loyer attendu vs encaissé sur 6 mois.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Attendu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Encaissement</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2 h-64 border-b border-gray-800 pb-2">
           {['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'].map((month, i) => (
             <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
               <div className="w-full flex justify-center gap-1 items-end h-full">
                 <motion.div 
                   initial={{ height: 0 }} animate={{ height: '90%' }}
                   className="w-1/3 bg-indigo-600/20 rounded-t-lg border-t border-x border-indigo-600/30 group-hover:bg-indigo-600/40 transition-all" 
                 />
                 <motion.div 
                   initial={{ height: 0 }} animate={{ height: `${75 + i * 3}%` }}
                   className="w-1/3 bg-green-500/60 rounded-t-lg border-t border-x border-green-500/30 group-hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" 
                 />
               </div>
               <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{month}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
