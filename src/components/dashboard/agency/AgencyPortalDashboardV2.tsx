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
  candidatures = [] 
}: { 
  user: any, 
  properties: any[], 
  candidatures?: any[] 
}) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  // Compute mock / realistic stats
  const totalBiens = properties.length;
  const totalUnites = properties.reduce((acc, p) => acc + (p.unitNumber ? 1 : (p.unites?.length || 1)), 0);
  const leasedUnites = properties.reduce((acc, p) => acc + (p.leases?.filter((l: any) => l.status !== "TERMINATED").length || 0), 0);
  const dispRate = totalUnites > 0 ? Math.round((leasedUnites / totalUnites) * 100) : 0;
  
  const pendingCands = candidatures.filter(c => c.status === "PENDING" || c.status === "VERIFIED").length;

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
          {/* SECURE ALERT */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-4">
            <ShieldCheck size={20} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
               <h3 className="text-[13px] font-bold text-rose-800">Protocoles de recouvrement actifs (MM-07)</h3>
               <p className="text-[12.5px] text-rose-700 mt-1">2 locataires sont en phase de relance avancée. Veuillez vérifier les dossiers en contentieux.</p>
            </div>
            <button className="ml-auto px-4 py-1.5 bg-white border border-rose-200 rounded text-[12px] font-semibold text-rose-600 hover:bg-rose-100">Voir les dossiers</button>
          </div>

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
                value="124 000 ₣" 
                sub="à reverser : 845k ₣" 
                trend="up" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SectionCard title="Gestion des candidatures" action="Voir tout">
              {[
                { nom: "Bamba K.", bien: "Villa Riviera", statut: "Vérifié", step: "Attente Bail", color: "green" },
                { nom: "Sylla M.", bien: "Appart. Zone 4", statut: "En cours", step: "A revoir", color: "amber" },
                { nom: "Touré F.", bien: "Studio Cocody", statut: "Nouveau", step: "Pièces maq.", color: "sky" }
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-[12.5px]">
                  <div>
                    <div className="font-medium text-slate-700">{c.nom} <span className="text-slate-400 font-normal ml-2">{c.bien}</span></div>
                  </div>
                  <div className="flex gap-3 items-center text-right">
                    <span className="text-[11px] text-slate-500">{c.step}</span>
                    <Badge color={c.color as any}>{c.statut}</Badge>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Mandats & Reversements" action="Détails">
              {[
                { mandant: "Société GIM", ref: "MAD-GIM-01", statut: "A REVERSER", montant: "450 000 ₣", color: "amber" },
                { mandant: "Kone Ali", ref: "MAD-KNA-02", statut: "REVERSÉ", montant: "120 000 ₣", color: "green" },
                { mandant: "SCI ImmoPlus", ref: "MAD-SCI-04", statut: "SOLDE INSUFF.", montant: "845 000 ₣", color: "rose" }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-[12.5px]">
                  <div>
                    <div className="font-medium text-slate-700">{m.mandant}</div>
                    <div className="text-[11px] text-slate-400 tracking-wider font-mono">{m.ref}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800">{m.montant}</div>
                    <Badge color={m.color as any}>{m.statut}</Badge>
                  </div>
                </div>
              ))}
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
