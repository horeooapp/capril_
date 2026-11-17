"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { Building2, Users, FileText, Settings2, BarChart3, Receipt, ClipboardList, ShieldCheck, Calculator, TrendingUp, Compass, Play, ChevronRight } from "lucide-react"



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
  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  // Real data from aggregates
  const walletBalance = aggregates?.walletBalance || 0;
  const totalBiens = aggregates?.activeLeasesCount || properties.length;
  const dispRate = aggregates?.occupancyRate || 0;
  const pendingCands = candidatures.filter(c => c.status === "PENDING" || c.status === "VERIFIED").length;
  const totalPortfolioValue = aggregates?.totalPortfolioValue || 0;

  const agencyDisplayName = user?.agencyName 
    || user?.nomAgence 
    || (user?.agencyConfig as any)?.agencyName 
    || (user?.agencyConfig as any)?.name 
    || user?.companyName 
    || user?.displayName 
    || user?.name 
    || "Mon Agence";

  return (
    <div className="space-y-6">
      
      {/* ── TOP BANNER AGENCE AVEC NOM OFFICIEL DE L'AGENCE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            <span className="text-xs font-medium text-slate-500">
              Espace Professionnel · Agence Immobilière
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Portefeuille & Gestion d'Agence · <span className="text-slate-600 font-normal">{agencyDisplayName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pilotez vos mandats, quittances certifiées et le suivi de vos portefeuilles clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link 
            href="/dashboard/ventes" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <TrendingUp size={15} />
            <span>Ventes & Terrains (ADD-25)</span>
          </Link>
          <Link 
            href="/dashboard/mandates" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Building2 size={15} />
            <span>Mes Mandats</span>
          </Link>
          <Link 
            href="/dashboard/matching" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors"
          >
            <Users size={15} className="text-slate-400" />
            <span>Candidatures</span>
          </Link>
        </div>
      </div>

      {/* ── BANNIÈRE VIDÉOS OFFICIELLES & DÉMONSTRATIONS QAPRIL ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Play size={16} className="text-amber-400 fill-amber-400 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Vidéos Officielles QAPRIL & FNUI</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Officiel</span>
              </div>
              <p className="text-[11px] text-slate-400">Démonstrations de la plateforme et de l'enregistrement officiel de bail</p>
            </div>
          </div>
          <Link
            href="/videos"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Voir l'espace vidéos</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <Link
            href="/videos"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all group"
          >
            <div className="w-7 h-7 rounded-md bg-amber-400/20 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-110 transition-transform">
              <Play size={12} className="fill-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">1. Présentation QAPRIL & FNUI</div>
              <div className="text-[10px] text-slate-400 truncate">Sécurisation légale & quittance (2m 14s)</div>
            </div>
          </Link>

          <Link
            href="/videos"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all group"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-110 transition-transform">
              <Play size={12} className="fill-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">2. Tutoriel Enregistrement du Bail</div>
              <div className="text-[10px] text-slate-400 truncate">Procédure DGI pas-à-pas (2m 16s)</div>
            </div>
          </Link>
        </div>
      </div>

      {/* HEADER / NAVIGATION INTÉGRÉE SI BESOIN */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
              { href: '/dashboard', label: 'Vue Globale', icon: <BarChart3 size={16} />, active: true },
              { href: '/dashboard/ventes', label: 'Ventes & Terrains (ADD-25)', icon: <TrendingUp size={16} /> },
              { href: '/dashboard/comptabilite', label: 'Comptabilité SYSCOHADA', icon: <Calculator size={16} /> },
              { href: '/dashboard/mandates', label: 'Mandats', icon: <Building2 size={16} /> },
              { href: '/dashboard/matching', label: 'Dossiers Locataires', icon: <Users size={16} /> },
              { href: '/dashboard/reports', label: 'CRG & Reversements', icon: <FileText size={16} /> },
          ].map((t) => (
              <Link 
                  key={t.href} 
                  href={t.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                      t.active 
                      ? "bg-slate-800 text-white" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                  {t.icon} {t.label}
              </Link>
          ))}
      </div>

      <div className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard 
                label="Baux actifs" 
                value={totalBiens.toString()} 
                sub={`Portefeuille : ${fmt(totalPortfolioValue)} XOF / mois`} 
            />
            <StatCard 
                label="Occupation" 
                value={`${dispRate}%`} 
                sub="Basé sur les lots actifs" 
            />
            <StatCard 
                label="Candidatures" 
                value={candidatures.length.toString()} 
                sub={`${pendingCands} en attente`} 
            />
            <StatCard 
                label="Wallet Agence" 
                value={`${fmt(walletBalance)} XOF`} 
                sub={`Commissions & Provision`} 
                trend="up" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SectionCard title="Gestion des candidatures" action={<Link href="/dashboard/matching" className="text-sky-600 hover:underline">Voir tout</Link>}>
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

            <SectionCard title="Mandats & Reversements" action={<Link href="/dashboard/mandates" className="text-sky-600 hover:underline">Détails</Link>}>
              <div className="text-[12px] text-slate-400 py-4 text-center">Aucun reversement de mandat en cours.</div>
            </SectionCard>
          </div>

          <SectionCard title="Actions rapides de gestion">
             <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-2">
                 {[
                      { label: "Nouveau Bail", icon: <Users size={16} />, href: "/dashboard/leases/new" },
                      { label: "Ventes & Terrains (ADD-25)", icon: <Compass size={16} />, href: "/dashboard/ventes" },
                      { label: "Comptabilité SYSCOHADA", icon: <Calculator size={16} />, href: "/dashboard/comptabilite" },
                      { label: "Opération Caisse", icon: <Receipt size={16} />, href: "/dashboard/wallet" },
                      { label: "Déclarer Incident", icon: <ShieldCheck size={16} />, href: "/dashboard/disputes" },
                      { label: "Générer CRG", icon: <ClipboardList size={16} />, href: "/dashboard/reports" },
                 ].map((action, i) => (
                     <Link key={i} href={action.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-[10px] hover:border-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition-all">
                         {action.icon}
                         <span className="text-[11px] font-semibold text-center">{action.label}</span>
                     </Link>
                 ))}
             </div>
          </SectionCard>
        </div>
    </div>
  );
}
