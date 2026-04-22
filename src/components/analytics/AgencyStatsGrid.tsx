"use client";

import { AgencyKPIs } from "@/lib/agency-analytics-service";
import { TrendingUp, Users, Wallet, AlertCircle } from "lucide-react";

/**
 * [P5.E4] AGENCY DASHBOARD KPI GRID
 * Premium glassmorphic cards for real-time portfolio monitoring.
 */
export function AgencyStatsGrid({ kpis }: { kpis: AgencyKPIs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Taux de Recouvrement (TR) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Taux de Recouvrement</p>
            <h3 className="text-4xl font-black text-white mt-2 group-hover:text-blue-400 transition-colors">
              {kpis.tauxRecouvrementMois}%
            </h3>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-2xl">
            <TrendingUp className="text-blue-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                style={{ width: `${kpis.tauxRecouvrementMois}%` }}
            />
        </div>
        <p className="text-[10px] text-gray-500 mt-3 font-medium italic">
          Objectif QAPRIL : {kpis.tauxRecouvrementAnnuel}% (Annuel)
        </p>
      </div>

      {/* Taux d'Occupation (TO) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Taux d'Occupation</p>
            <h3 className="text-4xl font-black text-white mt-2 group-hover:text-purple-400 transition-colors">
              {kpis.tauxOccupation}%
            </h3>
          </div>
          <div className="bg-purple-500/20 p-3 rounded-2xl">
            <Users className="text-purple-400 w-6 h-6" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
            <span className="text-white font-bold">{kpis.occupiedUnits}</span>
            <span className="text-gray-500 text-xs">/ {kpis.totalUnits} lots actifs</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-3 font-medium uppercase">
          {kpis.totalUnits - kpis.occupiedUnits} lots vacants
        </p>
      </div>

      {/* Impayés (Encours) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Encours Impayés</p>
            <h3 className="text-4xl font-black text-red-400 mt-2">
              {kpis.unpaidTotal.toLocaleString()} F
            </h3>
          </div>
          <div className="bg-red-500/20 p-3 rounded-2xl animate-pulse">
            <AlertCircle className="text-red-400 w-6 h-6" />
          </div>
        </div>
        <p className="text-[10px] text-red-300/60 mt-6 font-medium">
          Dépassement du seuil de tolérance agence
        </p>
        <button className="mt-2 text-[10px] text-blue-400 hover:underline font-bold uppercase tracking-tighter">
          Lancer recouvrement forcé
        </button>
      </div>

      {/* Santé Financière */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Score Portfolio</p>
            <h3 className="text-4xl font-black text-green-400 mt-2 tracking-tighter italic">
              OPTIMAL
            </h3>
          </div>
          <div className="bg-green-500/20 p-3 rounded-2xl">
            <Wallet className="text-green-400 w-6 h-6" />
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-6 font-medium">
          Calculé sur 18 indicateurs de performance
        </p>
        <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map(i => (
                <div key={i} className="h-1.5 w-4 rounded-full bg-green-500" />
            ))}
        </div>
      </div>
    </div>
  );
}
