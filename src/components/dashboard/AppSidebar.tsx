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
    Send,
    User,
    BarChart3,
    Settings,
    Zap,
    ShieldAlert,
    Receipt,
    Wallet,
    BookOpen
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"

interface AppSidebarProps {
    role: 'ADMIN' | 'SUPER_ADMIN' | 'TENANT' | 'LANDLORD' | 'CHAMPION' | 'AGENCY'
    onLogout: () => void | Promise<void>
    userName?: string | null
    diasporaAbonnement?: boolean
}

export default function AppSidebar({ role, onLogout, userName, diasporaAbonnement }: AppSidebarProps) {
    const pathname = usePathname()

    const getNavLinks = () => {
        if (role === 'TENANT') {
            return [
                { href: "/locataire", label: "Accueil", icon: <LayoutDashboard size={20} /> },
                { href: "/locataire/leases", label: "Mon bail", icon: <FileText size={20} /> },
                { href: "/locataire/receipts", label: "Quittances", icon: <Receipt size={20} /> },
                { href: "/locataire/cie-sodeci", label: "CIE / SODECI", icon: <Zap size={20} /> },
                { href: "/locataire/rights", label: "Mes droits", icon: <ShieldAlert size={20} /> },
                { href: "/locataire/preferences", label: "Profil", icon: <User size={20} /> },
                { href: "/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
            ]
        }
        
        if (role === 'AGENCY') {
            return [
                { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={20} /> },
                { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList size={20} /> },
                { href: "/dashboard/matching", label: "Candidats", icon: <User size={20} /> },
                { href: "/dashboard/properties", label: "Patrimoine", icon: <Building2 size={20} /> },
                { href: "/dashboard/receipts", label: "Comptabilité", icon: <FileText size={20} /> },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings size={20} /> },
                { href: "/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
            ]
        }
        
        // Owner / Default Links (5-tab focus + extras for desktop)
        return [
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
            ...(diasporaAbonnement ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={20} /> }] : []),
            { href: "/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
        ]
    }

    const navLinks = getNavLinks()

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-[60] p-6 hidden lg:block">
            <div className="h-full glass-panel border border-white/20 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                {/* Brand Logo Section */}
                <div className="p-8 border-b border-white/10 shrink-0">
                    <Link href={role === 'TENANT' ? "/locataire" : "/dashboard"} className="flex items-center gap-4 group">
                        <ProtectedLogo 
                            src="/logo.png" 
                            alt="QAPRIL" 
                            className="h-10 w-auto group-hover:scale-110 transition-transform duration-500 rounded-xl" 
                        />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black tracking-[0.2em] text-[#C55A11] uppercase mt-1">
                                {role === 'TENANT' ? 'Portal Locataire' : 'Propriétaire'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar mt-4">
                    {/* Public Home Link */}
                    <Link 
                        href="/"
                        className="relative group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-gray-400 hover:text-[#C55A11] hover:bg-[#C55A11]/5 border border-dashed border-gray-100 hover:border-[#C55A11]/30 mb-4"
                    >
                        <span className="relative z-10 transition-transform group-hover:scale-110">
                            <Home size={20} />
                        </span>
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] flex-1">
                            Retour à l'Accueil
                        </span>
                    </Link>

                    {navLinks.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`relative group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                                    isActive 
                                    ? "text-white" 
                                    : "text-gray-500 hover:text-[#1F4E79] hover:bg-white/40"
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-[#1F4E79] rounded-2xl shadow-lg shadow-[#1F4E79]/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-transform ${isActive ? "scale-110" : "group-hover:translate-x-1"}`}>
                                    {item.icon}
                                </span>
                                <span className="relative z-10 text-[13px] font-bold uppercase tracking-widest flex-1">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative z-10"
                                    >
                                        <ChevronRight size={14} />
                                    </motion.span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-6 mt-auto border-t border-white/10">
                    <button 
                        onClick={onLogout}
                        className="w-full h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 group shadow-sm"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                    
                    <div className="mt-6 text-center">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                            QAPRIL Portal v3.2 <br/>
                            <span className="opacity-50 italic">{userName || 'Compte Certifié'}</span>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
