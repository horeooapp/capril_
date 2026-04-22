"use client";

import { ChurnRisk } from "@/lib/retention-service";
import { AlertTriangle, Clock, MessageSquare, ArrowRight } from "lucide-react";

/**
 * [P5.E5] CHURN RISK DASHBOARD
 * Prioritized list of tenants likely to leave the platform.
 * Features AI-driven retention actions and risk visualizers.
 */
export function ChurnRiskList({ risks }: { risks: ChurnRisk[] }) {
  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
      <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter">Analyse de Rétention</h3>
          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Predictive Churn Engine V2</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-red-500/10 text-red-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-red-500/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {risks.length} risques critiques
            </div>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {risks.length === 0 ? (
            <div className="p-20 text-center">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aucun risque critique identifié sur cette période</p>
            </div>
        ) : (
            risks.map((risk) => (
            <div key={risk.leaseId} className="p-10 hover:bg-white/[0.03] transition-all duration-500 group relative">
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                <div className="flex gap-8">
                    {/* Gauge Visualizer */}
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                        <circle 
                            cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" 
                            strokeDasharray={226}
                            strokeDashoffset={226 - (226 * risk.probability) / 100}
                            className={risk.probability > 70 ? "text-red-500" : "text-yellow-500"}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-xl font-black text-white">{risk.probability}%</span>
                    </div>

                    <div className="flex flex-col justify-center">
                    <h4 className="text-white font-black text-2xl tracking-tight group-hover:text-blue-400 transition-colors">{risk.tenantName}</h4>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/5 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                                Expire dans {risk.daysUntilExpiration} j
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-red-500/10 rounded-lg">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            </div>
                            <span className="text-[11px] text-red-400/80 font-black uppercase tracking-tighter">
                                {risk.riskFactor}
                            </span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* AI Advice Card */}
                <div className="flex-1 max-w-lg bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[24px] transform group-hover:translate-x-[-8px] transition-transform">
                    <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">QAPRIL ADVISOR</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                        "{risk.retentionAction}"
                    </p>
                </div>

                {/* Interaction Trigger */}
                <button className="self-center bg-white text-black h-16 w-16 rounded-3xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all transform group-hover:scale-110 shadow-xl group-hover:rotate-12">
                    <ArrowRight className="w-7 h-7" />
                </button>
                </div>
            </div>
            ))
        )}
      </div>

      <div className="p-10 bg-white/5 border-t border-white/5 text-center">
        <button className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all hover:tracking-[0.5em]">
          Accéder au centre de médiation client
        </button>
      </div>
    </div>
  );
}
