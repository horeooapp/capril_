"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ShieldCheck, MapPin, Sparkles } from "lucide-react";

interface DistrictStat {
  district: string;
  avgRent: number;
  yieldRate: number;
  growth: string;
  demand: "Très Haute" | "Haute" | "Forte";
  barHeight: number;
}

const DISTRICT_DATA: DistrictStat[] = [
  { district: "Cocody Ambassades", avgRent: 850000, yieldRate: 9.4, growth: "+12.4%", demand: "Très Haute", barHeight: 88 },
  { district: "Plateau Affaires", avgRent: 950000, yieldRate: 8.8, growth: "+8.2%", demand: "Haute", barHeight: 96 },
  { district: "Riviera Golf / Bonoumin", avgRent: 650000, yieldRate: 10.2, growth: "+14.6%", demand: "Très Haute", barHeight: 74 },
  { district: "Marcory Zone 4", avgRent: 720000, yieldRate: 9.8, growth: "+11.1%", demand: "Très Haute", barHeight: 80 },
  { district: "Bingerville Nouveau Pôle", avgRent: 380000, yieldRate: 11.5, growth: "+18.3%", demand: "Très Haute", barHeight: 52 },
  { district: "Yopougon Résidentiel", avgRent: 220000, yieldRate: 10.8, growth: "+9.5%", demand: "Forte", barHeight: 38 },
];

export default function InteractiveMarketChart() {
  const [activeDistrict, setActiveDistrict] = useState<DistrictStat>(DISTRICT_DATA[0]);
  const [timeframe, setTimeframe] = useState<"12M" | "24M" | "LIVE">("12M");

  return (
    <div className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Glow d'ambiance Meta/Fintech */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header du Widget */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Observatoire Immodata Côte d'Ivoire · 2026
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Indice Dynamique des Loyers & Rendements
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Données certifiées des transactions réelles enregistrées sur les baux QAPRIL à Abidjan et périphérie.
          </p>
        </div>

        {/* Sélecteurs de Période (Style Apple Segmented Control) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start md:self-auto">
          {(["12M", "24M", "LIVE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "LIVE" ? "Flux Continu" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu Analytique : Grille Graphique + Métriques Clés */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
        {/* Colonne Gauche (7 cols) : Histogramme Interactif animé */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
            <span className="font-semibold uppercase tracking-wider">Marché par Secteur (Sélectionner une barre)</span>
            <span className="text-amber-400 font-mono text-[11px] font-bold">● Échantillon de 4 800+ baux</span>
          </div>

          <div className="h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 sm:px-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
            {DISTRICT_DATA.map((d) => {
              const isSelected = activeDistrict.district === d.district;
              return (
                <div
                  key={d.district}
                  onClick={() => setActiveDistrict(d)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip flottant au hover/select */}
                  <div
                    className={`text-[10px] font-mono font-bold mb-1.5 transition-all duration-200 ${
                      isSelected
                        ? "text-amber-400 opacity-100 scale-105"
                        : "text-slate-400 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {(d.avgRent / 1000).toFixed(0)}k
                  </div>

                  {/* Barre Animée Framer-motion */}
                  <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden p-1 flex items-end h-[85%] relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${d.barHeight}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`w-full rounded-t-lg transition-all duration-300 relative ${
                        isSelected
                          ? "bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-lg shadow-amber-500/40"
                          : "bg-slate-700/80 group-hover:bg-slate-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-t-lg pointer-events-none" />
                      )}
                    </motion.div>
                  </div>

                  {/* Label du quartier */}
                  <div className="mt-2 text-center w-full">
                    <span
                      className={`block text-[10px] truncate max-w-[65px] sm:max-w-[80px] font-semibold transition-colors ${
                        isSelected ? "text-white font-bold" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {d.district.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-amber-400 inline-block" />
              Secteur sélectionné
            </span>
            <span>Unité : XOF / Mois</span>
          </div>
        </div>

        {/* Colonne Droite (5 cols) : Carte Métrique du Quartier Actif */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl p-6 border border-slate-800 relative shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Secteur Analysé
                </span>
                <h4 className="text-base font-black text-white">{activeDistrict.district}</h4>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {activeDistrict.growth}
            </span>
          </div>

          {/* Grille de stats */}
          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">Loyer Médian</span>
              <div className="text-lg sm:text-xl font-black text-white font-mono">
                {activeDistrict.avgRent.toLocaleString("fr-FR")}
                <span className="text-[10px] text-slate-400 font-normal ml-1">XOF</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">Rendement Brut</span>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                {activeDistrict.yieldRate}%
                <span className="text-[10px] text-slate-400 font-normal ml-1">l'an</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 pt-1">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Pression Locative</span>
              <span className="font-bold text-white bg-amber-500/10 px-2 py-0.5 rounded text-[11px] text-amber-300">
                {activeDistrict.demand}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Délai Moyen de Relocation</span>
              <span className="font-bold text-emerald-400 font-mono">8 à 14 jours</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Taux de Recouvrement QAPRIL</span>
              <span className="font-bold text-sky-400 font-mono">99.7 %</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Données certifiées DGI & CDC-CI</span>
            </div>
            <span className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer">
              Simuler <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

