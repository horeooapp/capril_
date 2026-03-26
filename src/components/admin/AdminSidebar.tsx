"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
    LayoutDashboard, 
    Briefcase, 
    Database, 
    ArrowRightLeft, 
    BarChart3, 
    ShieldAlert, 
    Settings2, 
    Users, 
    ShieldCheck, 
    Newspaper,
    LogOut,
    ChevronRight,
    Bot,
    Scale,
    BookOpen,
    Trophy,
    ClipboardCheck,
    User,
    Home
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"

interface AdminSidebarProps {
    onLogout: () => Promise<void>
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
    const pathname = usePathname()

    const menuItems = [
        { href: "/admin", label: "Tableau de Bord", icon: <LayoutDashboard size={20} /> },
        { href: "/admin/agency", label: "Gestion Agence", icon: <Briefcase size={20} /> },
        { href: "/admin/migration", label: "Migration Data", icon: <Database size={20} /> },
        { href: "/admin/reversals", label: "Paiements PGW", icon: <ArrowRightLeft size={20} /> },
        { href: "/admin/declarations", label: "Déclarations SMS/WA", icon: <ShieldAlert size={20} /> },
        { href: "/admin/reports", label: "Rapports & Stats", icon: <BarChart3 size={20} /> },
        { href: "/admin/news", label: "Actualités Ticker", icon: <Newspaper size={20} />, active: true },
        { href: "/admin/compliance", label: "Conformité KYC", icon: <ShieldAlert size={20} /> },
        { href: "/admin/disputes", label: "Médiation & Litiges", icon: <Scale size={20} /> },
        { href: "/admin/system/ai-monitoring", label: "Supervision IA", icon: <Bot size={20} /> },
        { href: "/admin/settings/features", label: "Modules Core", icon: <Settings2 size={20} /> },
        { href: "/admin/users", label: "Utilisateurs", icon: <Users size={20} /> },
        { href: "/admin/champions", label: "Champions & Comms", icon: <Trophy size={20} /> },
        { href: "/admin/edl", label: "États des Lieux", icon: <ClipboardCheck size={20} /> },
        { href: "/admin/audit", label: "Logs d'Audit", icon: <ShieldCheck size={20} /> },
        { href: "/admin/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
        { href: "/admin/settings/profile", label: "Mon Profil", icon: <User size={20} /> },
    ]

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-[60] p-6 hidden lg:block">
            <div className="h-full glass-panel border border-white/20 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                {/* Brand Logo Section */}
                <div className="p-8 border-b border-white/10 shrink-0">
                    <Link href="/admin" className="flex items-center gap-4 group">
                        <ProtectedLogo 
                            src="/logo.png" 
                            alt="QAPRIL" 
                            className="h-10 w-auto group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black tracking-[0.2em] text-[#C55A11] uppercase">Management</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar mt-4">
                    {/* Public Home Link */}
                    <Link 
                        href="/"
                        className="relative group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-gray-400 hover:text-ivoire-orange hover:bg-ivoire-orange/5 border border-dashed border-gray-100 hover:border-ivoire-orange/30 mb-4"
                    >
                        <span className="relative z-10 transition-transform group-hover:scale-110">
                            <Home size={20} />
                        </span>
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] flex-1">
                            Retour à l&apos;Accueil
                        </span>
                    </Link>

                    {menuItems.map((item) => {
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
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">QAPRIL OS v3.2 Premium</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
