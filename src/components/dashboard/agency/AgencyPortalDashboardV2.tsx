"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { Building2, Users, FileText, Settings2, BarChart3, Receipt, ClipboardList, ShieldCheck } from "lucide-react"

type TabType = 'overview' | 'biens' | 'candidats' | 'outils';

export function AgencyPortalDashboardV2({ 
  user, 
  properties, 
  candidatures = [],
  aggregates
}: { 
  user: any, 
  properties: any[], 
  candidatures?: any[],
  aggregates?: any
}) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  // Compute mock / realistic stats
  const totalBiens = properties.length;
  const totalUnites = properties.reduce((acc, p) => acc + (p.unitNumber ? 1 : (p.unites?.length || 1)), 0);
  const leasedUnites = properties.reduce((acc, p) => acc + (p.leases?.filter((l: any) => l.status !== "TERMINATED").length || 0), 0);
  const dispRate = totalUnites > 0 ? Math.round((leasedUnites / totalUnites) * 100) : 0;
  
  const pendingCands = candidatures.filter(c => c.status === "PENDING" || c.status === "VERIFIED").length;

  const walletBalance = aggregates?.walletBalance || 0;

  return (
    <div className="space-y-6">
      
      {/* HEADER / NAVIGATION INTÉGRÉE SI BESOIN */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
              { id: 'overview', label: 'Vue Globale', icon: <BarChart3 size={16} /> },
              { id: 'biens', label: 'Mandats', icon: <Building2 size={16} /> },
              { id: 'candidats', label: 'Dossiers Locataires', icon: <Users size={16} /> },
              { id: 'outils', label: 'CRG & Reversements', icon: <FileText size={16} /> },
          ].map((t) => (
              <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                      activeTab === t.id 
                      ? "bg-slate-800 text-white" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                  {t.icon} {t.label}
              </button>
          ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard 
                label="Mandats actifs" 
                value={totalBiens.toString()} 
                sub={`${totalUnites} unités gérées`} 
            />
            <StatCard 
                label="Disponibilité" 
                value={`${dispRate}%`} 
                sub={`${leasedUnites} occupés sur ${totalUnites}`} 
            />
            <StatCard 
                label="Candidatures" 
                value={candidatures.length.toString()} 
                sub={`${pendingCands} en validation`} 
            />
            <StatCard 
                label="Commissions (Est.)" 
                value={`${fmt(walletBalance)} ₣`} 
                sub={`à reverser : ${fmt(walletBalance)} ₣`} 
                trend="up" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SectionCard title="Gestion des candidatures" action="Voir tout">
              {candidatures.length === 0 ? (
                 <div className="text-[12px] text-slate-400 py-4 text-center">Aucune candidature vérifiée en cours.</div>
              ) : candidatures.slice(0, 3).map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-[12.5px]">
                  <div>
                    <div className="font-medium text-slate-700">{c.nom || c.tenantName || `Candidat #${c.id}`} <span className="text-slate-400 font-normal ml-2">{c.bien || c.property?.name || 'Logement non défini'}</span></div>
                  </div>
                  <div className="flex gap-3 items-center text-right">
                    <span className="text-[11px] text-slate-500">{c.step || 'En validation'}</span>
                    <Badge color={(c.color || "sky") as any}>{c.status || c.statut}</Badge>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Mandats & Reversements" action="Détails">
              <div className="text-[12px] text-slate-400 py-4 text-center">Aucun reversement de mandat en cours.</div>
            </SectionCard>
          </div>

          <SectionCard title="Actions rapides de gestion">
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                 {[
                      { label: "Nouveau Locataire", icon: <Users size={16} />, href: "/dashboard/matching/new" },
                      { label: "Opération Caisse", icon: <Receipt size={16} />, href: "/dashboard/wallet/transaction" },
                      { label: "Déclarer Incident", icon: <ShieldCheck size={16} />, href: "/dashboard/disputes/new" },
                      { label: "Générer CRG", icon: <ClipboardList size={16} />, href: "/dashboard/reports" },
                 ].map((action, i) => (
                     <Link key={i} href={action.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-[10px] hover:border-slate-300 hover:bg-slate-100 text-slate-600 transition-all">
                         {action.icon}
                         <span className="text-[11px] font-semibold text-center">{action.label}</span>
                     </Link>
                 ))}
             </div>
          </SectionCard>
        </div>
      )}

      {/* Fallback to legacy components for other tabs temporarily during migration */}
      {activeTab !== 'overview' && (
         <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
             <Settings2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-2">Module en cours de modernisation</h3>
             <p className="text-sm">Cette section est actuellement en cours de migration vers le nouveau Design System.</p>
             <button onClick={() => setActiveTab('overview')} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-md text-[12.5px] font-semibold">Retour à l'overview</button>
         </div>
      )}
    </div>
  );
}
