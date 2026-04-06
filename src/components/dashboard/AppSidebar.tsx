"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
    LayoutDashboard, 
    Building2, 
    ClipboardList, 
    FileText, 
    Handshake, 
    Star, 
    Bot,
    Trophy,
    Globe,
    LogOut,
    Home,
    ChevronRight,
    User,
    BarChart3,
    Settings,
    Zap,
    ShieldAlert,
    Receipt,
    Wallet,
    BookOpen,
    Users
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"

interface AppSidebarProps {
    role: 'ADMIN' | 'SUPER_ADMIN' | 'TENANT' | 'LANDLORD' | 'CHAMPION' | 'AGENCY' | 'NON_CERTIFIED_AGENT' | 'INTERMEDIARY' | 'DIASPORA'
    onLogout: () => void | Promise<void>
    userName?: string | null
    diasporaAbonnement?: boolean
    agencyConfig?: { isManager?: boolean, permissions?: string[] } | null
    eligibleRoles?: string[]
}

export default function AppSidebar({ role, onLogout, userName, diasporaAbonnement, agencyConfig, eligibleRoles }: AppSidebarProps) {
    const pathname = usePathname()

    const getNavLinks = () => {
        if (role === 'TENANT') {
            return [
                { href: "/locataire", label: "Accueil", icon: <LayoutDashboard size={20} /> },
                { href: "/locataire/leases", label: "Mon bail", icon: <FileText size={20} /> },
                { href: "/locataire/receipts", label: "Quittances", icon: <Receipt size={20} /> },
                { href: "/locataire/cie-sodeci", label: "CIE / SODECI", icon: <Zap size={20} /> },
                { href: "/locataire/rights", label: "Mes droits", icon: <ShieldAlert size={20} /> },
                { href: "/locataire/profile", label: "Profil", icon: <User size={20} /> },
                { href: "/locataire/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
            ]
        }
        
        if (role === 'AGENCY' || role === 'NON_CERTIFIED_AGENT') {
            const isManager = agencyConfig?.isManager !== false // Default to manager if undefined to prevent locking out legacy users
            const perms = agencyConfig?.permissions || []

            const allLinks = [
                { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={20} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/matching", label: "Candidats", icon: <User size={20} />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/properties", label: "Patrimoine", icon: <Building2 size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList size={20} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/receipts", label: "Comptabilité", icon: <FileText size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings size={20} />, id: "SETTINGS" },
                { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen size={20} />, id: "MANUAL" },
                ...(isManager ? [{ href: "/dashboard/team", label: "Mon Équipe", icon: <Users size={20} />, id: "TEAM" }] : [])
            ]

            return allLinks.filter(l => isManager || ["SETTINGS", "MANUAL"].includes(l.id) || perms.includes(l.id))
        }
        
        // Default Links (5-tab focus + extras for desktop)
        const commonLinks = [
            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={20} /> },
            { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={20} /> },
            { href: "/dashboard/properties", label: "Logements", icon: <Building2 size={20} /> },
            { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList size={20} /> },
            { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={20} /> },
            { href: "/dashboard/profile", label: "Profil", icon: <User size={20} /> },
            { href: "/dashboard/matching", label: "Matching", icon: <Handshake size={20} /> },
            { href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={20} /> },
            { href: "/dashboard/trust", label: "Indice ICL", icon: <Star size={20} /> },
            { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot size={20} /> },
            ...(role === 'CHAMPION' ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy size={20} /> }] : []),
            ...(diasporaAbonnement || role === 'DIASPORA' ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={20} /> }] : []),
            { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
        ]

        return commonLinks;
    }

    const navLinks = getNavLinks()

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-[60] p-6 hidden lg:block">
            <div className="h-full bg-white border border-qgrey-2 rounded-[2.25rem] shadow-[0_24px_80px_rgba(13,43,110,0.05)] flex flex-col overflow-hidden relative">
                {/* Brand Logo Section */}
                <div className="p-8 shrink-0 flex items-center justify-between">
                    <Link href={role === 'TENANT' ? "/locataire" : "/dashboard"} className="flex flex-col gap-2 group">
                        <ProtectedLogo 
                            src="/logo.png" 
                            alt="QAPRIL" 
                            className="h-9 w-auto group-hover:scale-105 transition-transform duration-500 rounded-lg" 
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <div className="bg-qgreen rounded-md px-2 py-0.5 text-[9px] font-black text-white tracking-[0.15em] uppercase">
                                {role === 'TENANT' ? 'Locataire' 
                                 : role === 'AGENCY' ? 'Agence' 
                                 : role === 'NON_CERTIFIED_AGENT' ? 'Gestionnaire' 
                                 : role === 'INTERMEDIARY' ? 'Intermédiaire'
                                 : role === 'DIASPORA' ? 'Diaspora'
                                 : 'PROPRIÉTAIRE'}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-qgreen-light" />
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 no-scrollbar">
                    {/* Public Home Link */}
                    <Link 
                        href="/"
                        className="relative group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all text-qtext-light hover:text-qorange hover:bg-qorange-pale border border-dashed border-qgrey-2 hover:border-qorange/30 mb-6"
                    >
                        <span className="relative z-10 transition-transform group-hover:scale-110">
                            <Home size={18} />
                        </span>
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.15em] flex-1">
                            Accueil Public
                        </span>
                    </Link>

                    {navLinks.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`relative group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all ${
                                    isActive 
                                    ? "text-white" 
                                    : "text-qtext-light hover:text-qnavy hover:bg-qnavy-pale"
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-qnavy rounded-xl shadow-[0_8px_16px_rgba(13,43,110,0.2)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-transform ${isActive ? "scale-110" : "group-hover:translate-x-1"}`}>
                                    {item.icon}
                                </span>
                                <span className="relative z-10 text-[12px] font-black uppercase tracking-widest flex-1">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative z-10 text-white"
                                    >
                                        <ChevronRight size={16} />
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-6 mt-auto border-t border-qgrey-1 bg-qgrey-1/30">
                    {eligibleRoles && eligibleRoles.length > 1 && (
                        <Link 
                            href="/auth/choose-role"
                            className="w-full h-10 mb-2 bg-white text-qnavy border border-qgrey-2 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-qnavy-pale transition-all active:scale-95 group shadow-sm"
                        >
                            <User size={14} className="group-hover:scale-110 transition-transform" />
                            Changer de Profil
                        </Link>
                    )}
                    {(role === 'LANDLORD' || role === 'AGENCY' || role === 'CHAMPION') && (
                        <Link 
                            href="/onboarding"
                            className="w-full h-10 mb-2 bg-white text-[#C55A11] border border-[#C55A11]/20 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95 group shadow-sm"
                        >
                            <Building2 size={14} className="group-hover:scale-110 transition-transform" />
                            Ajouter une Casquette
                        </Link>
                    )}
                    <button 
                        onClick={onLogout}
                        className="w-full h-12 bg-qred-pale text-qred rounded-xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-qred hover:text-white transition-all active:scale-95 group shadow-sm"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                    
                    <div className="mt-5 text-center">
                        <p className="text-[9px] font-black text-qtext-light uppercase tracking-widest leading-relaxed">
                            QAPRIL Portal V4 <br/>
                            <span className="opacity-70">{userName || 'Compte Certifié'}</span>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
