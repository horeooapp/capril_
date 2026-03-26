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

import { AgencyPortalDashboard } from "@/components/dashboard/agency/AgencyPortalDashboard"

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
    regularizationAlert
}: { 
    user: any, 
    properties: any[],
    latestReport?: any,
    regularizationAlert?: React.ReactNode
}) {
    if (user?.role === 'AGENCY') {
        return <AgencyPortalDashboard />;
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
        { label: "Logements gérés", value: properties.length, unit: "Unités", icon: Building2, color: "text-orange-600 bg-orange-50", glow: "shadow-orange-200/40" },
        { label: "Sécurisé (CDC)", value: totalSecuredFunds, unit: "FCFA", icon: ShieldCheck, color: "text-blue-600 bg-blue-50", glow: "shadow-blue-200/40", isCurrency: true },
        { 
            label: "Conformité Fiscale", 
            value: totalLeases > 0 ? Math.round((fiscalCompliantCount / totalLeases) * 100) : 0, 
            unit: "% DGI", 
            icon: FileCheck, 
            color: "text-amber-600 bg-amber-50", 
            glow: "shadow-amber-200/40" 
        },
        { 
            label: "Performance / Mois", 
            value: latestReport?.dataRapport?.metrics?.tauxRecouvrement ?? (totalLeases > 0 ? Math.round((receiptsThisMonth / totalLeases) * 100) : 0), 
            unit: "%", 
            icon: Zap, 
            color: "text-violet-600 bg-violet-50", 
            glow: "shadow-violet-200/40" 
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
                    <h1 className="text-4xl lg:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">
                        Patrimoine.
                    </h1>
                    <p className="text-[16px] text-gray-500 font-medium tracking-wide flex items-center gap-2">
                        Bienvenue, <span className="text-[#1F4E79] font-black">{user?.name || user?.email?.split('@')[0]}</span> 
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[14px] font-black uppercase tracking-widest text-[#C55A11]">Vue d'ensemble</span>
                        {user?.isHoreoo && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-[#1F4E79] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-900/20">
                                <GraduationCap size={12} />
                                Programme Horeoo
                            </span>
                        )}
                    </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
                    <button className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm text-[#1F4E79]">
                        <TrendingUp size={16} className="text-[#C55A11]" />
                        Rapports d'activité
                    </button>
                    {user?.fraudScore < 20 && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                             <FileCheck size={18} className="text-emerald-600" />
                             <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Certifié</span>
                        </div>
                    )}
                    <div className="flex flex-col items-end px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wallet QAPRIL</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[16px] font-black text-[#1F4E79] leading-none">{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '0'} <span className="text-[12px]">FCFA</span></span>
                            <button className="p-1 bg-[#C55A11] text-white rounded-md hover:bg-[#A54A0D] transition-colors shadow-sm" title="Recharger">
                                <Plus size={14} />
                            </button>
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

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        variants={item}
                        className={`glass-card-premium p-10 rounded-[3rem] border border-white/40 shadow-2xl ${stat.glow} flex flex-col justify-between min-h-[240px] relative group hover:scale-[1.02] transition-all`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 leading-none">{stat.label}</span>
                                <div className="h-1 w-8 bg-[#1F4E79]/10 rounded-full"></div>
                            </div>
                            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                        </div>

                        <div className="relative z-10 mt-12">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#1F4E79] tracking-tighter leading-none">
                                    {stat.isCurrency ? stat.value.toLocaleString() : stat.value}
                                </span>
                                <span className="text-[14px] font-black uppercase tracking-widest text-gray-400">{stat.unit}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[12px] font-black uppercase tracking-widest text-[#375623]">Mise à jour réelle</span>
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
                    className="lg:col-span-4 glass-card-premium p-10 rounded-[3rem] bg-gray-900 text-white overflow-hidden relative group border-none shadow-orange-950/20 shadow-2xl"
                >
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600 blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600 blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
                    
                    <div className="relative z-10 flex flex-col h-full space-y-12">
                        <div>
                            <h2 className="text-4xl font-black mb-4 leading-none uppercase tracking-tighter italic">Actions.<br/>Directes</h2>
                            <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[200px]">Commandes ultra-rapides pour la gestion de votre parc immobilier.</p>
                        </div>
                        
                        <div className="space-y-4 mt-auto">
                            <Link href="/dashboard/properties/new" className="flex items-center justify-between p-7 bg-white/5 hover:bg-white/10 rounded-[2rem] transition-all group/link border border-white/5 hover:border-white/20 active:scale-95">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl group-hover/link:bg-white/20 transition-colors">
                                        <Plus size={20} />
                                    </div>
                                    <span className="font-black tracking-[0.1em] text-[14px] uppercase">Nouveau Logement</span>
                                </div>
                                <ArrowRight size={18} className="opacity-40 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                            </Link>
                            
                            <Link href="/dashboard/receipts" className="flex items-center justify-between p-7 bg-[#C55A11] hover:bg-[#A54A0D] rounded-[2.2rem] transition-all group/link shadow-2xl shadow-orange-950/40 active:scale-95">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Zap size={20} />
                                    </div>
                                    <span className="font-black tracking-[0.1em] text-[14px] uppercase">Générer Quittance</span>
                                </div>
                                <ChevronRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* Patrimoine Actif List */}
                <motion.section 
                    variants={item} 
                    className="lg:col-span-8 glass-panel p-12 rounded-[3.5rem] border border-white/50 shadow-2xl shadow-gray-100"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Patrimoine Actif.</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Index de vos 4 derniers actifs</span>
                                <span className="h-[1px] w-8 bg-gray-200"></span>
                            </div>
                        </div>
                        <Link href="/dashboard/properties" className="flex items-center gap-3 px-8 py-4 bg-[#F2F2F2] hover:bg-gray-100 text-[#1F4E79] rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 shadow-sm group">
                            Voir tout le parc
                            <Search size={16} className="group-hover:rotate-12 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {properties.slice(0, 4).map((prop, index) => (
                            <motion.div 
                                key={prop.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-8 bg-gray-50/30 hover:bg-white rounded-[2.5rem] transition-all border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/40 relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white flex items-center justify-center rounded-[1.8rem] text-2xl shadow-xl shadow-gray-200/50 border border-gray-50 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            <Building2 size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-[#1F4E79] text-2xl tracking-tighter leading-none uppercase">{prop.name || "Immeuble SS1"}</p>
                                                <span className="px-2 py-0.5 bg-orange-50 text-[#C55A11] text-[12px] font-black uppercase tracking-widest rounded border border-orange-100">Actif</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={12} className="text-gray-300" />
                                                    <span className="text-[14px] font-black uppercase tracking-widest">{prop.city}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={12} className="text-gray-300" />
                                                    <span className="text-[14px] font-black uppercase tracking-widest">{(prop.leases?.length || 0)} Locataires</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                        <div className="flex items-center gap-6 self-end md:self-center">
                                            <div className="hidden sm:flex flex-col items-end">
                                                <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Performance</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-24 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${
                                                                (prop.leases?.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / (prop.leases?.length || 1)) * 100 > 80 
                                                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                                                : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                                                            }`} 
                                                            style={{ 
                                                                width: `${prop.leases?.length ? Math.round((prop.leases.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / prop.leases.length) * 100) : 0}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-[14px] font-black ${
                                                        (prop.leases?.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / (prop.leases?.length || 1)) * 100 > 80 
                                                        ? 'text-emerald-600' 
                                                        : 'text-orange-600'
                                                    }`}>
                                                        {prop.leases?.length ? Math.round((prop.leases.filter((l:any) => l.receipts?.some((r:any) => new Date(r.paidAt) >= startOfMonth)).length / prop.leases.length) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/dashboard/properties/${prop.id}`}
                                                className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm group/btn"
                                            >
                                                <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
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
