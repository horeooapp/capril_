"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
    LayoutDashboard, 
    Telescope, 
    Users, 
    ShieldCheck, 
    Settings, 
    FileText, 
    LogOut, 
    User,
    Activity,
    Settings2,
    Briefcase,
    Database,
    ShieldAlert,
    ArrowRightLeft,
    BarChart3,
    Newspaper,
    BookOpen
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import MobileMenu from "@/components/MobileMenu"

interface AdminHeaderProps {
    session: any
    onLogout: () => Promise<void>
}

export default function AdminHeader({ session, onLogout }: AdminHeaderProps) {
    const pathname = usePathname()

    const navLinks = [
        { href: "/admin", label: "Vue Globale", icon: <LayoutDashboard size={18} /> },
        { href: "/admin/agency", label: "Agence", icon: <Briefcase size={18} /> },
        { href: "/admin/migration", label: "Migration", icon: <Database size={18} /> },
        { href: "/admin/reversals", label: "Paiements", icon: <ArrowRightLeft size={18} /> },
        { href: "/admin/reports", label: "Rapports", icon: <BarChart3 size={18} /> },
        { href: "/admin/news", label: "Actualités", icon: <Newspaper size={18} /> },
        { href: "/admin/compliance", label: "Conformité", icon: <ShieldAlert size={18} /> },
        { href: "/admin/settings/features", label: "Modules", icon: <Settings2 size={18} /> },
        { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
        { href: "/admin/audit", label: "Audit", icon: <ShieldCheck size={18} /> },
        { href: "/admin/manual", label: "Manuel", icon: <BookOpen size={18} /> },
    ]

    return (
        <header className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel h-20 px-8 rounded-[2rem] flex items-center justify-between border border-white/40 shadow-2xl shadow-gray-950/20"
            >
                <div className="flex items-center gap-8">
                    {/* Logo - Hidden on large screens where sidebar is visible */}
                    <Link href="/admin" className="flex lg:hidden items-center space-x-4 group">
                        <ProtectedLogo 
                            src="/logo.png" 
                            alt="QAPRIL Logo" 
                            className="h-10 w-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 rounded-[0.8rem] shadow-xl border border-white/40 ring-1 ring-black/5" 
                        />
                        <div className="flex flex-col">
                            <span className="font-black text-2xl tracking-tighter text-[#1F4E79] leading-none uppercase">QAPRIL</span>
                        </div>
                    </Link>

                    {/* Breadcrumb or Title for Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C55A11]"></div>
                        <span className="text-[12px] font-black tracking-[0.3em] text-[#1F4E79] uppercase">
                            {navLinks.find(l => l.href === pathname)?.label || "Administration"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-6 border-x border-gray-100/50 h-10">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                             <Activity size={14} className="animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Live Node: ABJ-01</span>
                        </div>
                        <NotificationCenter />
                    </div>

                    {session?.user && (
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-black tracking-widest text-[#1F4E79] uppercase">
                                        {session.user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                    </span>
                                    {session.user.activePlanTier && (
                                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter">
                                            {session.user.activePlanTier}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[12px] font-bold text-[#C55A11] uppercase tracking-tighter">{session.user.email}</span>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg group hover:rotate-6 transition-all cursor-pointer border border-gray-800">
                                <User size={20} />
                            </div>
                        </div>
                    )}
                    
                    <div className="flex lg:hidden">
                        <MobileMenu 
                            links={navLinks.map(l => ({ ...l, icon: undefined }))} 
                            session={session} 
                            variant="light" 
                            onLogout={onLogout} 
                        />
                    </div>

                    <button 
                        onClick={onLogout}
                        className="hidden md:flex items-center justify-center h-12 w-12 bg-white border border-gray-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-sm active:scale-95 group"
                        title="Déconnexion"
                    >
                        <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </header>
    )
}
