"use client"

import { motion } from "framer-motion"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"
import { 
    Building2, 
    ClipboardList, 
    ShieldCheck, 
    Zap, 
    Plus, 
    ArrowRight,
    Search,
    ChevronRight,
    TrendingUp,
    MapPin,
    Users,
    GraduationCap,
    FileCheck,
    ShieldAlert,
    BarChart3
} from "lucide-react"
import MonthlyReportCard from "@/components/dashboard/reports/MonthlyReportCard"

import AgencyPortalWrapper from "./agency/AgencyPortalWrapper"
import OwnerPortalWrapper from "./owner/OwnerPortalWrapper"
import IntermediairePortalDashboard from "@/components/dashboard/intermediaire/IntermediairePortalDashboard"
import DiasporaPortalWrapper from "./diaspora/DiasporaPortalWrapper"
import { DiasporaDashboardData } from "@/types/diaspora"
import { TenantPortalDashboard } from "@/components/dashboard/tenant/TenantPortalDashboard"

interface DashboardProperty {
    id: string;
    name?: string | null;
    address: string;
    city: string;
    neighborhood: string;
    leases: Array<{
        id: string;
        cdcDeposits: Array<{ amount: number }>;
        receipts?: Array<{ paidAt: Date | string | null }>;
    }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardOverviewClient({ 
    user, 
    properties,
    latestReport,
    regularizationAlert,
    diasporaData,
    intermData,
    agencyData,
    tenantData
}: { 
    user: any, 
    properties: any[],
    latestReport?: any,
    regularizationAlert?: React.ReactNode,
    diasporaData?: DiasporaDashboardData | null,
    intermData?: any,
    agencyData?: any,
    tenantData?: { bail: any, receipts: any[] }
}) {
    if (user?.role === 'TENANT') {
        const bailInfo = tenantData?.bail;
        // Logic for bailleur masking MM-04b
        const bailleurInfo = bailInfo ? (() => {
            const isAgree = bailInfo.typeGestion === 'agreee';
            const isMasque = bailInfo.bailleurMasque === true;
            const landlordCode = `BAI-${(bailInfo.landlord?.id || '000').slice(0, 3).toUpperCase()}`;

            if (isAgree) {
                return { 
                    valeur: bailInfo.landlord?.name || "Agence de Gestion", 
                    refBailleur: landlordCode,
                    mention: "Agence agréée — substitution totale exclusive",
                    type: "AGENCE"
                };
            }

            if (isMasque) {
                return { 
                    valeur: landlordCode, 
                    mention: "Le propriétaire a choisi de ne pas divulguer son identité",
                    type: "BAILLEUR"
                };
            }

            return { 
                valeur: bailInfo.landlord?.name || "Bailleur", 
                mention: bailInfo.typeGestion === 'non_agreee' ? "Intermédiaire de gestion — identité visible" : "Gestion directe — identité visible",
                type: "BAILLEUR"
            };
        })() : { valeur: "—", mention: "Chargement...", type: "BAILLEUR" };

        return (
            <TenantPortalDashboard 
                user={user}
                bail={bailInfo}
                bailleur={bailleurInfo}
                quittances={tenantData?.receipts || []}
                abonnements={[]}
                tickets={[]}
                caution={null}
                mrlDemandes={[]}
            />
        );
    }

    if (user?.profileType === 'INTERMEDIARY') {
        return <IntermediairePortalDashboard data={intermData} session={{ user }} />;
    }

    if (user?.role === 'AGENCY') {
        return <AgencyPortalWrapper />;
    }

    if (user?.role === 'LANDLORD' || user?.role === 'LANDLORD_PRO') {
        if (diasporaData) {
            return <DiasporaPortalWrapper />;
        }
        return <OwnerPortalWrapper />;
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    let totalLeases = 0
    let totalSecuredFunds = 0
    let receiptsThisMonth = 0
    let fiscalCompliantCount = 0

    // Single pass optimization for all core stats
    properties.forEach((p: DashboardProperty) => {
        totalLeases += (p.leases?.length || 0)
        p.leases?.forEach((l: any) => {
            if (l.cdcDeposits?.[0]?.amount) totalSecuredFunds += l.cdcDeposits[0].amount
            if (l.receipts) {
                receiptsThisMonth += l.receipts.filter((r: any) => r.paidAt && new Date(r.paidAt) >= startOfMonth).length
            }
            if (l.statutFiscal === "PAYE_CONFIRME" || l.statutFiscal === "ENREGISTRE") {
                fiscalCompliantCount++
            }
        })
    })

    const stats = [
        { label: "Logements gérés", value: properties.length, unit: "Unités", icon: Building2, color: "text-qorange bg-qorange-pale", glow: "shadow-qorange/20" },
        { label: "Sécurisé (CDC)", value: totalSecuredFunds, unit: "FCFA", icon: ShieldCheck, color: "text-qgreen bg-qgreen-pale", glow: "shadow-qgreen/20", isCurrency: true },
        { 
            label: "Conformité Fiscale", 
            value: totalLeases > 0 ? Math.round((fiscalCompliantCount / totalLeases) * 100) : 0, 
            unit: "% DGI", 
            icon: FileCheck, 
            color: "text-qnavy bg-qnavy-pale", 
            glow: "shadow-qnavy/20" 
        },
        { 
            label: "Performance / Mois", 
            value: latestReport?.dataRapport?.metrics?.tauxRecouvrement ?? (totalLeases > 0 ? Math.round((receiptsThisMonth / totalLeases) * 100) : 0), 
            unit: "%", 
            icon: Zap, 
            color: "text-qteal bg-qteal-pale", 
            glow: "shadow-qteal/20" 
        },
    ]


    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-16"
        >
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-qnavy-dark tracking-tighter uppercase leading-none">
                        Patrimoine.
                    </h1>
                    <p className="text-[16px] text-qtext-light font-medium tracking-wide flex items-center gap-2">
                        Bienvenue, <span className="text-qnavy font-black">{user?.name || user?.email?.split('@')[0]}</span> 
                        <span className="w-1 h-1 bg-qgrey-2 rounded-full"></span>
                        <span className="text-[14px] font-black uppercase tracking-widest text-qorange">Vue d'ensemble</span>
                        {user?.isHoreoo && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-qnavy text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-qnavy/20">
                                <GraduationCap size={12} />
                                Programme Horeoo
                            </span>
                        )}
                    </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
                    <button className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-qgrey-2 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-qgrey-1 transition-colors shadow-sm text-qnavy">
                        <TrendingUp size={16} className="text-qorange" />
                        Rapports d'activité
                    </button>
                    {user?.fraudScore < 20 && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-qgreen-pale border border-qgreen/10 rounded-2xl">
                             <FileCheck size={18} className="text-qgreen" />
                             <span className="text-[11px] font-black text-qgreen-light uppercase tracking-widest">Certifié</span>
                        </div>
                    )}
                    <div className="flex flex-col items-end px-4 py-2 bg-white border border-qgrey-2 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Wallet QAPRIL</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[16px] font-black text-qnavy-dark leading-none">{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '0'} <span className="text-[12px]">FCFA</span></span>
                            <Link href="/dashboard/wallet" className="p-1.5 bg-qorange text-white rounded-md hover:opacity-80 transition-colors shadow-sm" title="Recharger">
                                <Plus size={14} />
                            </Link>
                        </div>
                    </div>
                    {user && <ReliabilityBadge score={100 - (user?.fraudScore || 15)} />}
                </div>
            </div>

            {regularizationAlert}

            {latestReport && (
                <div className="mb-12">
                   <MonthlyReportCard report={latestReport} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        variants={item}
                        className={`bg-white p-8 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.05)] flex flex-col justify-between min-h-[220px] relative group hover:scale-[1.02] transition-all overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-qgrey-1 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-qtext-light mb-1.5 leading-none">{stat.label}</span>
                                <div className="h-1 w-8 bg-qgrey-2 rounded-full"></div>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-[14px] flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform border border-white/50`}>
                                <stat.icon size={24} />
                            </div>
                        </div>

                        <div className="relative z-10 mt-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-qnavy-dark tracking-tighter leading-none">
                                    {stat.isCurrency ? stat.value.toLocaleString() : stat.value}
                                </span>
                                <span className="text-[13px] font-black uppercase tracking-widest text-qtext-mid">{stat.unit}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-qgreen animate-pulse"></span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-qgreen-light">Mise à jour réelle</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions & Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Command Panel (Propriétaire Focus) */}
                <motion.section 
                    variants={item} 
                    className="lg:col-span-4 bg-[linear-gradient(135deg,var(--color-qnavy-dark)_0%,var(--color-qnavy)_100%)] p-10 rounded-[2.5rem] text-white overflow-hidden relative group shadow-[0_20px_60px_rgba(7,26,69,0.3)]"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-qnavy-light blur-[100px] opacity-40 rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-qgreen blur-[100px] opacity-20 rounded-full"></div>
                    
                    <div className="relative z-10 flex flex-col h-full space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg"><Zap size={16} /></div>
                                <h2 className="text-2xl font-black uppercase tracking-widest">Actions Directes</h2>
                            </div>
                            <p className="text-[13px] font-medium text-white/60 leading-relaxed max-w-[220px]">Pilotez votre portefeuille instantanément avec ces accès rapides.</p>
                        </div>
                        
                        <div className="space-y-4 mt-auto">
                            <Link href="/dashboard/properties/new" className="flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 rounded-[1.5rem] transition-all group/link border border-white/10 active:scale-95">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 rounded-xl">
                                        <Plus size={18} />
                                    </div>
                                    <span className="font-black tracking-[0.15em] text-[13px] uppercase">Nouveau Logement</span>
                                </div>
                                <ArrowRight size={16} className="opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                            </Link>
                            
                            <Link href="/dashboard/receipts" className="flex items-center justify-between p-6 bg-[linear-gradient(145deg,var(--color-qgreen-light)_0%,var(--color-qgreen)_100%)] hover:opacity-90 rounded-[1.5rem] transition-all group/link shadow-lg shadow-qgreen/30 active:scale-95">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/20 rounded-xl">
                                        <FileCheck size={18} />
                                    </div>
                                    <span className="font-black tracking-[0.15em] text-[13px] uppercase drop-shadow-sm">Générer Quittance</span>
                                </div>
                                <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform drop-shadow-sm" />
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* Patrimoine Actif List */}
                <motion.section 
                    variants={item} 
                    className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-qgrey-2 shadow-[0_24px_80px_rgba(13,43,110,0.05)]"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-qnavy-dark uppercase tracking-widest">Patrimoine Actif</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[13px] font-black text-qtext-light uppercase tracking-widest">Index de vos 4 derniers actifs</span>
                                <span className="h-[2px] w-12 bg-qgrey-2 rounded-full"></span>
                            </div>
                        </div>
                        <Link href="/dashboard/properties" className="flex items-center gap-3 px-6 py-3.5 bg-qnavy-pale hover:bg-qnavy text-qnavy hover:text-white rounded-[1.25rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all group active:scale-95">
                            Voir tout le parc
                            <Search size={16} className="group-hover:rotate-12 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {properties.slice(0, 4).map((prop, index) => (
                            <motion.div 
                                key={prop.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-6 bg-background/50 hover:bg-white rounded-[2rem] transition-all border border-transparent hover:border-qgrey-2 hover:shadow-[0_12px_40px_rgba(13,43,110,0.06)] relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-[4.5rem] h-[4.5rem] bg-white flex items-center justify-center rounded-2xl text-qnavy shadow-[0_4px_16px_rgba(13,43,110,0.08)] border border-qgrey-1 group-hover:bg-qnavy group-hover:text-white transition-all duration-300">
                                            <Building2 size={28} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-qnavy-dark text-xl tracking-tighter leading-none uppercase">{prop.name || "Immeuble SS1"}</p>
                                                <span className="px-3 py-1 bg-qorange-pale text-qorange text-[10px] font-black uppercase tracking-widest rounded-md border border-qorange/20">Actif</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-qtext-light">
                                                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-qgrey-1">
                                                    <MapPin size={12} className="text-qtext-mid" />
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-qtext-mid">{prop.city}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-qgrey-1">
                                                    <Users size={12} className="text-qtext-mid" />
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-qtext-mid">{(prop.leases?.length || 0)} Locs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <span className="text-[12px] font-black text-qtext-light uppercase tracking-widest mb-1.5 shrink-0">Performance</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-24 bg-qgrey-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            (prop.leases?.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / (prop.leases?.length || 1)) * 100 > 80 
                                                            ? 'bg-qgreen' 
                                                            : 'bg-qorange'
                                                        }`} 
                                                        style={{ 
                                                            width: `${prop.leases?.length ? Math.round((prop.leases.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / prop.leases.length) * 100) : 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[12px] font-black shrink-0 ${
                                                    (prop.leases?.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / (prop.leases?.length || 1)) * 100 > 80 
                                                    ? 'text-qgreen' 
                                                    : 'text-qorange'
                                                }`}>
                                                    {prop.leases?.length ? Math.round((prop.leases.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / prop.leases.length) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/dashboard/properties/${prop.id}`}
                                            className="w-[3.5rem] h-[3.5rem] shrink-0 rounded-[1rem] bg-qnavy-pale text-qnavy flex items-center justify-center hover:bg-qnavy hover:text-white transition-all group/btn active:scale-95 border border-qnavy/10"
                                        >
                                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </motion.div>
    )
}
