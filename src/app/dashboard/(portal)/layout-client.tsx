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
    dbActiveRole,
    agencyConfig,
}: {
    children: React.ReactNode
    session: any
    dbActiveRole?: string
    agencyConfig?: any
}) {
    const pathname = usePathname()

    // Bypasses NextAuth cookie latency by using DB validated role from layout.tsx
    const activeRole = dbActiveRole || session?.user?.chosenRole || session?.user?.role;
    const isAgency = ['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY'].includes(activeRole || '');
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

    const getDashboardTitle = () => {
        switch (activeRole) {
            case 'TENANT': return "Console Locataire";
            case 'DIASPORA': return "Console Diaspora";
            case 'INTERMEDIARY': return "Console Intermédiaire";
            case 'CHAMPION': return "Console Champion";
            case 'AGENCY':
            case 'AGENCE_AGREE':
            case 'AGENCY_AGREE': return "Console Agence Certifiée";
            case 'NON_CERTIFIED_AGENT':
            case 'AGENCE_NON_AGREE':
            case 'AGENCY_NON_AGREE': return "Console Gestionnaire";
            case 'LANDLORD':
            default: return "Console Propriétaire";
        }
    }

    const getRoleBadge = () => {
        switch (activeRole) {
            case 'TENANT': return "Locataire";
            case 'DIASPORA': return "Diaspora";
            case 'INTERMEDIARY': return "Intermédiaire";
            case 'CHAMPION': return "Champion";
            case 'AGENCY':
            case 'AGENCE_AGREE':
            case 'AGENCY_AGREE': return "Agence Certifiée";
            case 'NON_CERTIFIED_AGENT':
            case 'AGENCE_NON_AGREE':
            case 'AGENCY_NON_AGREE': return "Gestionnaire";
            case 'LANDLORD':
            default: return "Propriétaire Titulaire";
        }
    }

    const handleLogout = () => signOut({ callbackUrl: "/" });

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
            {/* Pure Light Grey workspace */}
            <div className="fixed inset-0 bg-qbg -z-20"></div>
            
            {/* Vertical Sidebar - Dark Mode Fixe */}
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
                {/* Ultra Clean Top Navigation Bar */}
                <header className="sticky top-0 z-50 bg-white border-b border-qgrey-2 shadow-sm">
                    <div className="h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
                        
                        <div className="flex items-center gap-6">
                            {/* Mobile Logo */}
                            <Link href="/dashboard" className="flex lg:hidden items-center group">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-8 w-auto group-hover:scale-105 transition-transform duration-700" 
                                />
                            </Link>

                            <div className="hidden lg:flex items-center gap-4">
                                <h2 className="text-sm font-bold text-qnavy tracking-wide uppercase">{getDashboardTitle()}</h2>
                                <div className="h-4 w-px bg-qgrey-2"></div>
                                <span className="text-xs font-semibold text-qtext-light">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-qgrey-2 h-8">
                                <button className="text-qtext-light hover:text-qnavy transition-colors">
                                    <Search size={18} />
                                </button>
                                <div className="text-qtext-light hover:text-qnavy transition-colors">
                                    <NotificationCenter />
                                </div>
                            </div>

                            {session?.user && (
                                <div className="flex items-center gap-4 pl-2 lg:pl-0">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="bg-qgreen/10 text-qgreen rounded px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                                                {getRoleBadge()}
                                            </div>
                                        </div>
                                        <span className="text-[13px] font-bold text-qtext-mid">{(session.user.firstName ? session.user.firstName + " " : "") + (session.user.lastName || "") || session.user.email?.split('@')[0]}</span>
                                    </div>
                                    <Link 
                                        href="/dashboard/profile"
                                        className="w-10 h-10 rounded-full bg-qbg border border-qgrey-2 text-qnavy flex items-center justify-center hover:bg-qgrey-2 transition-all cursor-pointer"
                                    >
                                        <User size={18} />
                                    </Link>

                                    {/* Quick Logout Button */}
                                    <button 
                                        onClick={handleLogout}
                                        className="hidden sm:flex items-center justify-center w-10 h-10 text-qtext-light hover:bg-qred-pale hover:text-qred rounded-full transition-all group"
                                        title="Déconnexion"
                                    >
                                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex xl:hidden text-qnavy">
                                <MobileMenu 
                                    links={navLinks} 
                                    session={session} 
                                    variant="dark" 
                                    onLogout={() => signOut()} 
                                />
                            </div>
                        </div>
                    </div>
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
                        // Show "Profils" if the user has multiple roles OR is a manager (to allow switching to other capacities)
                        ...((session.user.eligibleRoles?.length > 1 || (session.user as any).capacites?.length > 1)
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
