"use client"

import React from "react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import { 
    LayoutDashboard, 
    ClipboardList, 
    Users, 
    Store, 
    Wallet, 
    CalendarDays, 
    ArrowUpRight,
    Handshake,
    Building2,
    CheckCircle2
} from "lucide-react"

export function BrokerPortalDashboard({
    user,
    mandates = [],
    properties = [],
    candidatures = [],
    stats = {}
}: {
    user: any,
    mandates?: any[],
    properties?: any[],
    candidatures?: any[],
    stats?: any
}) {
    const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

    const totalCommissions = stats.totalCommissions || 0;
    const totalMandats = mandates.length;
    const pendingCandidatures = (candidatures || []).filter(c => c.status === "PENDING" || c.status === "VERIFIED").length;
    const activeProperties = properties.length;

    return (
        <div className="space-y-6">
            
            {/* Header / Navigation Métier Démarcheur */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { href: '/dashboard', label: 'Synthèse Activité', icon: <LayoutDashboard size={16} />, active: true },
                    { href: '/dashboard/mandates', label: 'Mandats Prospection', icon: <ClipboardList size={16} /> },
                    { href: '/dashboard/matching', label: 'Candidatures & Rapprochement', icon: <Users size={16} /> },
                    { href: '/dashboard/marketplace', label: 'Marketplace Annonces', icon: <Store size={16} /> },
                    { href: '/dashboard/receipts', label: 'Commissions & Apports', icon: <Wallet size={16} /> },
                ].map((t) => (
                    <Link 
                        key={t.href} 
                        href={t.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                            t.active 
                            ? "bg-violet-700 text-white" 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {t.icon} {t.label}
                    </Link>
                ))}
            </div>

            {/* Statistiques Métier Spécifiques Démarcheur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    label="Mandats Prospection" 
                    value={totalMandats.toString()} 
                    sub="Mandats actifs confiant la prospection" 
                />
                <StatCard 
                    label="Biens Rapprochés" 
                    value={activeProperties.toString()} 
                    sub="Lots rattachés aux mandats" 
                />
                <StatCard 
                    label="Candidatures Suivies" 
                    value={(candidatures.length || 0).toString()} 
                    sub={`${pendingCandidatures} en cours de traitement`} 
                />
                <StatCard 
                    label="Commissions Générées" 
                    value={`${fmt(totalCommissions)} XOF`} 
                    sub="Cumul des honoraires d'apport" 
                    trend="up" 
                />
            </div>

            {/* Sections Candidatures & Mandats de prospection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard title="Candidatures & Rapprochements Récents" action="Voir tout">
                    {candidatures.length === 0 ? (
                        <div className="text-[12px] text-slate-400 py-6 text-center flex flex-col items-center">
                            <Users className="w-8 h-8 text-slate-300 mb-2" />
                            <p>Aucune candidature locataire en cours.</p>
                            <Link href="/dashboard/matching" className="mt-3 text-violet-600 font-bold text-xs hover:underline inline-flex items-center gap-1">
                                Créer un dossier candidat <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        candidatures.slice(0, 4).map((c, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-[12.5px]">
                                <div>
                                    <div className="font-semibold text-slate-800">
                                        {c.nom || c.tenantName || `Candidat #${c.id}`}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {c.bien || c.property?.name || 'Bien non rattaché'}
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Badge color={c.status === "CONFIRMED" ? "emerald" : "violet"}>
                                        {c.status || "En cours"}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </SectionCard>

                <SectionCard title="Mandats de Prospection Actifs" action="Détails">
                    {mandates.length === 0 ? (
                        <div className="text-[12px] text-slate-400 py-6 text-center flex flex-col items-center">
                            <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
                            <p>Aucun mandat de prospection enregistré.</p>
                            <Link href="/dashboard/mandates" className="mt-3 text-violet-600 font-bold text-xs hover:underline inline-flex items-center gap-1">
                                Consulter les mandats <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        mandates.slice(0, 4).map((m, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-[12.5px]">
                                <div>
                                    <div className="font-semibold text-slate-800">
                                        Mandat #{m.reference || m.id.substring(0, 8)}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Propriétaire : {m.proprietaire?.firstName} {m.proprietaire?.lastName}
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 size={12} /> Actif
                                </span>
                            </div>
                        ))
                    )}
                </SectionCard>
            </div>

            {/* Actions Rapides Démarcheur */}
            <SectionCard title="Actions rapides métier">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                    {[
                        { label: "Nouveau Rapprochement", icon: <Users size={16} />, href: "/dashboard/matching" },
                        { label: "Marketplace Biens", icon: <Store size={16} />, href: "/dashboard/marketplace" },
                        { label: "Planifier Visite", icon: <CalendarDays size={16} />, href: "/dashboard/agenda" },
                        { label: "Solde & Reversements", icon: <Wallet size={16} />, href: "/dashboard/wallet" },
                    ].map((act, i) => (
                        <Link 
                            key={i} 
                            href={act.href}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-violet-50/50 hover:border-violet-300 transition-all text-center group shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                {act.icon}
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-violet-900 transition-colors">
                                {act.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </SectionCard>

        </div>
    )
}
