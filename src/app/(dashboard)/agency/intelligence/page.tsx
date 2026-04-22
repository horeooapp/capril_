import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgencyAnalyticsService } from "@/lib/agency-analytics-service";
import { RetentionService } from "@/lib/retention-service";
import { MarketService } from "@/lib/market-service";
import { FiscalService } from "@/lib/fiscal-service";

import { AgencyStatsGrid } from "@/components/analytics/AgencyStatsGrid";
import { ChurnRiskList } from "@/components/analytics/ChurnRiskList";
import { MarketPositioningCard } from "@/components/analytics/MarketPositioningCard";
import { TaxSimulatorUI } from "@/components/analytics/TaxSimulatorUI";

/**
 * [P5.Final] CONSOLIDATED INTELLIGENCE HUB
 * Central command center for real-time portfolio orchestration.
 */
export default async function IntelligenceDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // 1. Fetch KPIs
  const kpis = await AgencyAnalyticsService.getAgencyKPIs(userId);

  // 2. Fetch Churn Risks
  const churnRisks = await RetentionService.getChurnRisks(5);

  // 3. Fetch Sample Market Benchmark (First active property)
  const firstProperty = await prisma.property.findFirst({
    where: { ownerUserId: userId },
    select: { id: true }
  });
  
  let benchmark = null;
  if (firstProperty) {
    benchmark = await MarketService.getPropertyBenchmark(firstProperty.id);
  }

  // 4. Fetch Tax Simulation
  const currentYear = new Date().getFullYear();
  const taxSimulation = await FiscalService.simulateTaxRegimes(userId, currentYear);

  return (
    <div className="min-h-screen bg-[#020203] text-white p-6 lg:p-12 space-y-12 selection:bg-blue-500 selection:text-white">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative">
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-blue-500 rounded-full" />
                <span className="text-blue-500 font-black text-[10px] tracking-[0.4em] uppercase">Intelligence Hub</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">
                PILOTAGE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">STRATÉGIQUE</span>
            </h1>
        </div>
        <div className="flex flex-col items-end">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Calculé par QAPRIL Engine V4.2</p>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-mono text-sm uppercase tracking-tighter">Live Portfolio Status</span>
            </div>
        </div>
      </div>

      {/* 1. FINANCIAL OVERVIEW */}
      <section className="space-y-6">
        <AgencyStatsGrid kpis={kpis} />
      </section>

      {/* 2. OPERATIONAL INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Left: Retention & Churn */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight">Rétention & Satisfaction</h2>
            <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">CONFIGURER ALERTES</button>
          </div>
          <ChurnRiskList risks={churnRisks} />
        </div>

        {/* Right: Market Pulse */}
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black tracking-tight">Observatoire</h2>
                <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">SCAN COMPLET</button>
            </div>
            {benchmark ? (
                <MarketPositioningCard benchmark={benchmark} />
            ) : (
                <div className="bg-white/5 border border-white/5 p-12 rounded-[40px] text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Aucune donnée de marché disponible pour ce secteur</p>
                </div>
            )}
        </div>
      </div>

      {/* 3. TAX & OPTIMIZATION */}
      <section className="space-y-8 pt-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-4xl font-black tracking-tight">Optimisation Fiscale Automatisée</h2>
            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                Notre simulateur compare en temps réel vos revenus réels perçus sur QAPRIL avec les régimes fiscaux en vigueur pour maximiser votre rendement net.
            </p>
        </div>
        <TaxSimulatorUI simulation={taxSimulation} />
      </section>

      {/* FOOTER */}
      <footer className="pt-24 pb-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="text-[10px] font-black tracking-[0.3em] uppercase">QAPRIL AI ORCHESTRATOR © 2026</div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-400">Documentation API</a>
            <a href="#" className="hover:text-blue-400">Compliance DGI</a>
            <a href="#" className="hover:text-blue-400">Support</a>
        </div>
      </footer>
    </div>
  );
}
