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
    BookOpen,
    Users
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
    agencyConfig,
}: {
    children: React.ReactNode
    session: any
    agencyConfig?: any
}) {
    const pathname = usePathname()

    const activeRole = session?.user?.chosenRole || session?.user?.role;
    const isAgency = ['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE'].includes(activeRole);
    const isIntermediary = activeRole === 'INTERMEDIARY';
    const isManager = isAgency && (agencyConfig?.isManager !== false);
    const perms = agencyConfig?.permissions || [];

    const getNavLinks = () => {
        if (isAgency) {
            const allLinks = [
                { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={18} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/matching", label: "Candidats", icon: <Handshake size={18} />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/properties", label: "Logements", icon: <Building2 size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList size={18} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/receipts", label: "Compta", icon: <FileText size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings size={18} />, id: "SETTINGS" },
                ...(isManager ? [{ href: "/dashboard/team", label: "Équipe", icon: <Users size={18} />, id: "TEAM" }] : [])
            ];
            return allLinks.filter(l => isManager || ["SETTINGS", "MANUAL"].includes(l.id) || perms.includes(l.id));
        }

        return [
            { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
            { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={18} /> },
            { href: "/dashboard/properties", label: "Logements", icon: <Building2 size={18} /> },
            { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList size={18} /> },
            { href: "/dashboard/receipts", label: "Quittances", icon: <FileText size={18} /> },
            { href: "/dashboard/matching", label: "Matching", icon: <Handshake size={18} /> },
            ...(activeRole === 'TENANT' 
                ? [{ href: "/dashboard/certificates", label: "Passeport", icon: <FileCheck2 size={18} /> }]
                : [{ href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={18} /> }]
            ),
            { href: "/dashboard/trust", label: "Indice ICL", icon: <Star size={18} /> },
            { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot size={18} /> },
            ...(activeRole === 'CHAMPION' 
                ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy size={18} /> }]
                : []
            ),
            ...(session?.user?.diasporaAbonnement || activeRole === 'DIASPORA'
                ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={18} /> }]
                : []
            ),
        ];
    }

    const navLinks = getNavLinks();

    const handleLogout = () => signOut({ callbackUrl: "/" });

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
            {/* Solid QAPRIL background */}
            <div className="fixed inset-0 bg-[#F2F5FA] -z-20"></div>
            
            {/* Vertical Sidebar - Only for Desktop */}
            {session?.user && (
                <AppSidebar 
                    role={activeRole} 
                    onLogout={() => signOut()} 
                    userName={(session.user.firstName ? session.user.firstName + " " : "") + (session.user.lastName || "") || session.user.email?.split('@')[0]}
                    diasporaAbonnement={session.user.diasporaAbonnement || activeRole === 'DIASPORA'}
                    agencyConfig={agencyConfig}
                    eligibleRoles={session.user.eligibleRoles}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Ultra Premium Floating Header - Simplified for Sidebar */}
                <header className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="h-24 px-8 rounded-[2.25rem] flex items-center justify-between border border-qnavy/10 shadow-[0_24px_80px_rgba(13,43,110,0.15)] bg-[linear-gradient(145deg,var(--color-qnavy-dark)_0%,var(--color-qgreen)_100%)] relative overflow-hidden"
                    >
                        {/* Motif décoratif V4 */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                        
                        <div className="flex items-center gap-10 relative z-10">
                            {/* Mobile Logo Only or Sidebar Toggle */}
                            <Link href="/dashboard" className="flex lg:hidden items-center space-x-5 group">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-11 w-auto group-hover:scale-105 transition-transform duration-700 rounded-xl shadow-2xl border border-white/60" 
                                />
                            </Link>

                            <div className="hidden lg:block">
                                <h2 className="text-[12px] font-black tracking-[0.2em] text-white uppercase opacity-70">Console d'Excellence Immobilière</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="hidden lg:flex items-center gap-6 px-6 border-r border-white/20 h-10">
                                <button className="text-white/60 hover:text-white transition-colors">
                                    <Search size={18} />
                                </button>
                                <div className="text-white/80 hover:text-white transition-colors">
                                    <NotificationCenter />
                                </div>
                            </div>

                            {session?.user && (
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="bg-qgreen rounded-md px-2 py-0.5 text-[8px] font-black text-white tracking-[0.2em] uppercase">
                                                {session.user.role === 'CHAMPION' ? 'Champion' : 'Certifié'}
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-qgreen-light" />
                                        </div>
                                        <span className="text-[16px] font-black tracking-tight text-white uppercase drop-shadow-sm">{(session.user.firstName ? session.user.firstName + " " : "") + (session.user.lastName || "") || session.user.email?.split('@')[0]}</span>
                                    </div>
                                    <Link 
                                        href="/dashboard/profile"
                                        className="w-11 h-11 rounded-[14px] bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg group hover:bg-white/20 transition-all cursor-pointer"
                                    >
                                        <User size={20} />
                                    </Link>

                                    {/* Quick Logout Button */}
                                    <button 
                                        onClick={handleLogout}
                                        className="hidden sm:flex items-center justify-center h-11 w-11 bg-white/5 border border-white/10 text-white/50 rounded-[14px] hover:bg-qred hover:text-white hover:border-qred transition-all active:scale-95 group"
                                        title="Déconnexion"
                                    >
                                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex xl:hidden text-white drop-shadow-sm">
                                <MobileMenu 
                                    links={navLinks} 
                                    session={session} 
                                    variant="dark" 
                                    onLogout={() => signOut()} 
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
                
                {session?.user && (
                    <BottomNav items={[
                        ...navLinks, 
                        ...(session.user.eligibleRoles?.length > 1 
                            ? [{ href: "/auth/choose-role", label: "Profils", icon: <User size={24} /> }] 
                            : []),
                        { label: "Quitter", icon: <LogOut size={24} />, onClick: () => handleLogout() }
                    ]} />
                )}
            </main>

            {/* Footer de courtoisie Premium - Uniquement sur Desktop */}
            <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100/50 mt-12 mb-24 hidden lg:block">
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
