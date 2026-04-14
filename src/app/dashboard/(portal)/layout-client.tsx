"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
    Search,
    Bell,
    LogOut,
    User,
    LayoutDashboard, 
    Building2, 
    ClipboardList, 
    FileText, 
    Handshake, 
    Star, 
    Bot,
    Trophy,
    Globe,
    BarChart3,
    Settings,
    Wallet
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
    dbActiveRole,
    agencyConfig,
}: {
    children: React.ReactNode
    session: any
    dbActiveRole?: string
    agencyConfig?: any
}) {
    const pathname = usePathname()

    const activeRole = dbActiveRole || session?.user?.chosenRole || session?.user?.role;
    
    // Determine Theme Accent
    const getThemeAndAccent = () => {
        if (activeRole === 'TENANT') return { id: 'amber', bg: 'bg-amber-600', text: 'text-amber-800' } as const;
        if (['INTERMEDIARY', 'CHAMPION'].includes(activeRole || '')) return { id: 'violet', bg: 'bg-violet-600', text: 'text-violet-800' } as const;
        if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE'].includes(activeRole || '')) {
            return { id: 'sky', bg: 'bg-sky-600', text: 'text-sky-800' } as const;
        }
        return { id: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-800' } as const; // Default Landlord
    };

    const theme = getThemeAndAccent();
    const initials = session?.user?.firstName ? session.user.firstName.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || 'U');

    const getPageMeta = () => {
        const path = pathname.split('?')[0];
        if (path.endsWith('/dashboard')) return { title: 'Vue globale', subtitle: 'Synthèse de mon activité' };
        if (path.includes('/properties')) return { title: 'Mes biens', subtitle: 'Propriétés & unités en gestion' };
        if (path.includes('/leases')) return { title: 'Baux et Contrats', subtitle: 'Suivi des contrats locatifs' };
        if (path.includes('/receipts')) return { title: 'Comptabilité', subtitle: 'Quittances et loyers' };
        if (path.includes('/disputes')) return { title: 'Contentieux', subtitle: 'Impayés et alertes légales' };
        if (path.includes('/matching')) return { title: 'Candidatures', subtitle: 'Dossiers locataires' };
        if (path.includes('/fiscal')) return { title: 'Fiscal & DGI', subtitle: 'Déclarations et impôts' };
        if (path.includes('/wallet')) return { title: 'Mon Wallet', subtitle: 'Solde et virements de loyers' };
        if (path.includes('/profile')) return { title: 'Mon profil', subtitle: 'Paramètres du compte' };
        if (path.includes('/mandates')) return { title: 'Mandats', subtitle: 'Actes de gestion' };
        return { title: 'Dashboards', subtitle: 'https://qapril.ci/dashboard' };
    }

    const unreadNotifMode = false; // Add real hook later

    const meta = getPageMeta();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
            
            {/* Sidebar Desktop */}
            {session?.user && (
                <AppSidebar 
                    role={activeRole} 
                    onLogout={() => signOut()} 
                    userName={(session.user.firstName ? session.user.firstName + " " : "") + (session.user.lastName || "") || session.user.email?.split('@')[0]}
                    themeId={theme.id}
                    diasporaAbonnement={session.user.diasporaAbonnement || activeRole === 'DIASPORA'}
                    agencyConfig={agencyConfig}
                    eligibleRoles={session.user.eligibleRoles || [session.user.role]}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-[220px] transition-all duration-300 h-screen overflow-hidden">
                {/* Slim Top Navigation Bar */}
                <header className="px-4 lg:px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <div className="font-bold text-[16px] text-slate-800 leading-none">
                            {meta.title}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-1">
                            {meta.subtitle}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop Search & Notifs */}
                        <div className="hidden lg:flex items-center gap-4 pr-5 border-r border-slate-200">
                            <button className="text-slate-400 hover:text-slate-700 transition-colors">
                                <Search size={18} />
                            </button>
                            <div className="text-slate-400 hover:text-slate-700 transition-colors relative cursor-pointer">
                                <NotificationCenter />
                                {unreadNotifMode && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500"></span>}
                            </div>
                        </div>

                        {session?.user && (
                            <div className="flex items-center gap-3">
                                {/* Profile Avatar configured with Accent Color */}
                                <Link href="/dashboard/profile" className={`w-[34px] h-[34px] rounded-full ${theme.bg} flex items-center justify-center text-white font-bold text-[13px] hover:shadow-md transition-all`}>
                                    {initials}
                                </Link>

                                <button 
                                    onClick={() => signOut()}
                                    className="hidden sm:flex text-slate-400 hover:text-rose-500 transition-colors ml-1"
                                    title="Déconnexion"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        )}
                        
                        {/* Mobile Hamburgers Menu */}
                        <div className="flex lg:hidden text-slate-800 ml-2">
                            <MobileMenu 
                                links={[]} // Managed internally by MobileMenu mostly
                                session={session} 
                                variant="dark" 
                                onLogout={() => signOut()}
                                activeRole={activeRole} 
                            />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="p-4 sm:p-5 lg:p-6 pb-24 lg:pb-12 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                {session?.user && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                        <BottomNav items={[
                            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={24} /> },
                            { href: "/dashboard/properties", label: "Biens", icon: <Building2 size={24} /> },
                            { href: "/dashboard/leases", label: "Baux", icon: <ClipboardList size={24} /> },
                            { href: "/dashboard/receipts", label: "Finance", icon: <Wallet size={24} /> },
                            { label: "Profils", icon: <User size={24} />, onClick: () => { window.location.href = "/auth/choose-role" } }
                        ]} />
                    </div>
                )}
            </div>
        </div>
    )
}
