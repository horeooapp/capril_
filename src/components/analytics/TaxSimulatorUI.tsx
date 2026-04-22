"use client";

import { TaxSimulation } from "@/lib/fiscal-service";
import { Calculator, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import { useState } from "react";

/**
 * [P5.E4] TAX SIMULATOR UI
 * Interactive comparison between standard "Foncier" and optimized "BIC" regimes.
 */
export function TaxSimulatorUI({ simulation }: { simulation: TaxSimulation }) {
  const [selected, setSelected] = useState<"FONCIER" | "BIC">(
    simulation.regimeOptimal === "BIC" ? "BIC" : "FONCIER"
  );

  const current = selected === "FONCIER" ? simulation.foncier : simulation.bic;
  const isOptimal = selected === simulation.regimeOptimal;

  return (
    <div className="bg-slate-950 rounded-[40px] p-2 border border-white/5 shadow-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-white/5 rounded-[38px] p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Calculator className="text-yellow-400 w-8 h-8" />
                    Optimisation Fiscale
                </h2>
                <p className="text-gray-500 text-sm mt-1">Simulateur intelligent basé sur l'exercice {simulation.exercice}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Zap className="text-green-400 w-5 h-5 fill-green-400" />
                <span className="text-green-400 font-bold">Économie possible : {simulation.economiePotentielle.toLocaleString()} F</span>
            </div>
        </div>

        {/* Switcher */}
        <div className="flex bg-black/40 p-2 rounded-3xl mb-12 border border-white/5">
            <button 
                onClick={() => setSelected("FONCIER")}
                className={`flex-1 py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${selected === "FONCIER" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
                REVENU FONCIER (STD)
            </button>
            <button 
                onClick={() => setSelected("BIC")}
                className={`flex-1 py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${selected === "BIC" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
                BIC SIMPLIFIÉ (PROFESSIONNEL)
            </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Impôt Estimé</p>
                <p className="text-4xl font-black text-white">{current.impotEstime.toLocaleString()} F</p>
                {isOptimal && (
                    <div className="inline-flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold">
                        <ShieldCheck className="w-3 h-3" /> RÉGIME OPTIMAL
                    </div>
                )}
            </div>

            <div className="space-y-2 border-l border-white/5 pl-8">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Abattement Applicable</p>
                <p className="text-4xl font-black text-white">{current.abattement.toLocaleString()} F</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{selected === "BIC" ? "Réduction Forfaitaire" : "Déduction Frais Réels"}</p>
            </div>

            <div className="space-y-2 border-l border-white/5 pl-8">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Rendement Net Après Impôt</p>
                <p className="text-4xl font-black text-blue-400">{current.netApresImpot.toLocaleString()} F</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Performance de l'actif</p>
            </div>
        </div>

        {/* Footer Advice */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-xs italic max-w-md">
                "Selon nos algorithmes, basculer vers le régime BIC vous permettrait de maximiser votre cash-flow dès le mois prochain."
            </p>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all group">
                ÉDITER MON DOSSIER FISCAL
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
}
