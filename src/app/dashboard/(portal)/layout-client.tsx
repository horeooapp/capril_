"use client"

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
    LogOut,
    User,
    ChevronRight,
    Search,
    Receipt,
    Bell,
    BarChart3,
    FileCheck2
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import MobileMenu from "@/components/MobileMenu"
import BottomNav from "@/components/BottomNav"
import { signOut } from "next-auth/react"

export default function DashboardLayoutClient({
    children,
    session,
}: {
    children: React.ReactNode
    session: any
}) {
    const pathname = usePathname()

    const navLinks = [
        { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
        { href: "/dashboard/properties", label: "Logements", icon: <Building2 size={18} /> },
        { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList size={18} /> },
        { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={18} /> },
        ...(session?.user?.role === 'TENANT' 
            ? [{ href: "/dashboard/certificates", label: "Passeport", icon: <FileCheck2 size={18} /> }]
            : [{ href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={18} /> }]
        ),
        { href: "/dashboard/trust", label: "Indice ICL", icon: <Star size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
            {/* Ultra Premium Floating Header */}
            <header className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel h-20 px-8 rounded-[2rem] flex items-center justify-between border border-white/40 shadow-2xl shadow-gray-200/50"
                >
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center space-x-4 group">
                            <div className="relative">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-10 w-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 rounded-lg shadow-lg border border-white/50" 
                                />
                                <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-2xl tracking-tighter text-[#1F4E79] leading-none uppercase">QAPRIL</span>
                                <span className="text-[12px] font-black tracking-[0.3em] text-[#C55A11] mt-1 uppercase">Gestionnaire de Patrimoine</span>
                            </div>
                        </Link>

                        <nav className="hidden xl:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link 
                                        key={link.href} 
                                        href={link.href}
                                        className={`relative px-5 py-2.5 text-[14px] font-bold uppercase tracking-[0.1em] transition-all rounded-xl flex items-center gap-2 group/nav ${
                                            isActive ? "text-[#1F4E79]" : "text-gray-400 hover:text-[#1F4E79]"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="nav-pill-owner"
                                                className="absolute inset-0 bg-white shadow-xl shadow-gray-200/50 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`relative z-10 transition-transform ${isActive ? "scale-110" : "group-hover/nav:scale-110"}`}>
                                            {link.icon}
                                        </span>
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-6 px-6 border-x border-gray-100/50 h-10">
                            <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                <Search size={18} />
                            </button>
                            <NotificationCenter />
                        </div>

                        {session?.user && (
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-[14px] font-black tracking-widest text-[#1F4E79] uppercase">{session.user.name || session.user.email?.split('@')[0]}</span>
                                    <span className="text-[12px] font-bold text-[#C55A11] uppercase tracking-tighter">Propriétaire Certifié</span>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg group hover:rotate-6 transition-all cursor-pointer">
                                    <User size={20} />
                                </div>
                            </div>
                        )}
                        
                        <div className="flex xl:hidden">
                            <MobileMenu 
                                links={navLinks} 
                                session={session} 
                                variant="light" 
                                onLogout={() => signOut({ callbackUrl: "/" })} 
                            />
                        </div>

                        <button 
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="hidden md:flex items-center justify-center h-12 w-12 bg-white border border-gray-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-sm active:scale-95 group"
                            title="Déconnexion"
                        >
                            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Main Content with Entry Animations */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
                
                <BottomNav items={
                    session.user.role === 'TENANT' 
                        ? [
                            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={24} /> },
                            { href: "/dashboard/payments", label: "Payer", icon: <Receipt size={24} /> },
                            { href: "/dashboard/alerts", label: "Alertes", icon: <Bell size={24} /> },
                            { href: "/account", label: "Compte", icon: <User size={24} /> },
                          ]
                        : [
                            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={24} /> },
                            { href: "/dashboard/properties", label: "Biens", icon: <Building2 size={24} /> },
                            { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={24} /> },
                            { href: "/dashboard/alerts", label: "Alertes", icon: <Bell size={24} /> },
                            { href: "/account", label: "Compte", icon: <User size={24} /> },
                          ]
                } />
            </main>

            {/* Footer de courtoisie Premium */}
            <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100/50 mt-12 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em]">© 2024 QAPRIL • Excellence en Gestion Immobilière</p>
                    <div className="flex gap-10">
                        <span className="text-[14px] font-black text-[#1F4E79] uppercase tracking-[0.2em] cursor-pointer hover:opacity-70 transition-opacity">Centre d'aide</span>
                        <span className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:opacity-70 transition-opacity">Sécurité</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
