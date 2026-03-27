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
    FileCheck2,
    Bot,
    Trophy,
    Globe,
    Settings,
    Wallet,
    BookOpen
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import MobileMenu from "@/components/MobileMenu"
import BottomNav from "@/components/BottomNav"
import { signOut } from "next-auth/react"

import AppSidebar from "@/components/dashboard/AppSidebar"

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
        { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={18} /> },
        { href: "/dashboard/properties", label: "Logements", icon: <Building2 size={18} /> },
        { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList size={18} /> },
        { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={18} /> },
        { href: "/dashboard/matching", label: "Matching", icon: <Handshake size={18} /> },
        ...(session?.user?.role === 'TENANT' 
            ? [{ href: "/dashboard/certificates", label: "Passeport", icon: <FileCheck2 size={18} /> }]
            : [{ href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={18} /> }]
        ),
        { href: "/dashboard/trust", label: "Indice ICL", icon: <Star size={18} /> },
        { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot size={18} /> },
        ...(session?.user?.role === 'CHAMPION' 
            ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy size={18} /> }]
            : []
        ),
        ...(session?.user?.diasporaAbonnement 
            ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={18} /> }]
            : []
        ),
    ];

    const handleLogout = () => signOut({ callbackUrl: "/" });

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
            {/* Vertical Sidebar - Only for Desktop */}
            {session?.user && (
                <AppSidebar 
                    role={session.user.role as any} 
                    onLogout={handleLogout}
                    userName={session.user.name || session.user.email}
                    diasporaAbonnement={session.user.diasporaAbonnement}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Ultra Premium Floating Header - Simplified for Sidebar */}
                <header className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-panel h-20 px-8 rounded-[2rem] flex items-center justify-between border border-white/40 shadow-2xl shadow-gray-200/50"
                    >
                        <div className="flex items-center gap-10">
                            {/* Mobile Logo Only or Sidebar Toggle */}
                            <Link href="/dashboard" className="flex lg:hidden items-center space-x-5 group">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-11 w-auto group-hover:scale-105 transition-transform duration-700 rounded-xl shadow-2xl border border-white/60" 
                                />
                            </Link>

                            <div className="hidden lg:block">
                                <h2 className="text-[14px] font-black tracking-[0.2em] text-[#1F4E79] uppercase opacity-60">Console d'Excellence Immobilière</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-6 px-6 border-r border-gray-100/50 h-10">
                                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <Search size={18} />
                                </button>
                                <NotificationCenter />
                            </div>

                            {session?.user && (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[14px] font-black tracking-widest text-[#1F4E79] uppercase">{session.user.name || session.user.email?.split('@')[0]}</span>
                                        <span className="text-[12px] font-bold text-[#C55A11] uppercase tracking-tighter">
                                            {session.user.role === 'CHAMPION' ? 'Champion QAPRIL' : 'Propriétaire Certifié'}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg group hover:rotate-6 transition-all cursor-pointer">
                                        <User size={20} />
                                    </div>

                                    {/* Quick Logout Button */}
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center justify-center h-10 w-10 bg-white border border-gray-200 text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-sm active:scale-95 group"
                                        title="Déconnexion"
                                    >
                                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex xl:hidden">
                                <MobileMenu 
                                    links={navLinks} 
                                    session={session} 
                                    variant="light" 
                                    onLogout={handleLogout} 
                                />
                            </div>
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
                    session.user.role === 'AGENCY'
                        ? [
                            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={24} /> },
                            { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList size={24} /> },
                            { href: "/dashboard/matching", label: "Candidats", icon: <User size={24} /> },
                            { href: "/dashboard/properties", label: "Patrimoine", icon: <Building2 size={24} /> },
                            { href: "/dashboard/receipts", label: "Comptes", icon: <FileText size={24} /> },
                            { href: "/manual", label: "Manuel", icon: <BookOpen size={24} /> },
                          ]
                        : [
                            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={24} /> },
                            { href: "/dashboard/properties", label: "Biens", icon: <Building2 size={24} /> },
                            { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList size={24} /> },
                            { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={24} /> },
                            { href: "/manual", label: "Manuel", icon: <BookOpen size={24} /> },
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
    </div>
    )
}
