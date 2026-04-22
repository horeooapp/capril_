"use client";

import { BenchmarkResult } from "@/lib/market-service";
import { Search, TrendingUp, Info } from "lucide-react";

/**
 * [P5.E4] MARKET POSITIONING UI
 * Visual comparison between property rent and market observatory data.
 */
export function MarketPositioningCard({ benchmark }: { benchmark: BenchmarkResult }) {
  const isOverMarket = benchmark.gapPct < 0;
  
  return (
    <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
      {/* Abstract Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
        {/* Market Visualizer */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center border-r border-white/5 pr-8">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Positionnement Observatoire</p>
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={552}
                        strokeDashoffset={552 - (552 * Math.abs(benchmark.gapPct)) / 100}
                        className={isOverMarket ? "text-red-500" : "text-green-500"}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{Math.abs(benchmark.gapPct)}%</span>
                    <span className="text-[10px] text-gray-400 font-bold">{isOverMarket ? "AU DESSUS" : "SOUS LE MARCHÉ"}</span>
                </div>
            </div>
        </div>

        {/* Data & Actions */}
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h4 className="text-white font-bold tracking-tight">{benchmark.propertyName}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Votre Loyer</p>
                    <p className="text-2xl font-black text-white">{benchmark.currentRent.toLocaleString()} F</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Moyenne Secteur</p>
                    <p className="text-2xl font-black text-blue-400">{benchmark.marketAvg.toLocaleString()} F</p>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-4">
                <div className="bg-blue-500 p-2 rounded-xl">
                    <TrendingUp className="text-white w-5 h-5" />
                </div>
                <div>
                    <p className="text-blue-200 text-sm font-bold">Recommandation QAPRIL</p>
                    <p className="text-blue-200/60 text-xs mt-1">
                        {benchmark.recommendation === "AUGMENTER" 
                            ? `Opportunité de gain : +${benchmark.potentialGain?.toLocaleString()} F / mois`
                            : "Loyer compétitif. Fidélisation locataire recommandée."}
                    </p>
                </div>
            </div>

            <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-blue-400 hover:text-white transition-all transform active:scale-95 uppercase text-xs tracking-tighter">
                Appliquer la révision suggérée
            </button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
        <Info className="w-3 h-3" />
        <span>Données certifiées basées sur 4,250 transactions réelles dans la commune de Cocody.</span>
      </div>
    </div>
  );
}
