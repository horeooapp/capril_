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
            case 'AGENCY_AGREE': return "Agence Certifiée";
            case 'NON_CERTIFIED_AGENT':
            case 'AGENCE_NON_AGREE':
            case 'AGENCY_NON_AGREE': return "Gestionnaire";
            case 'LANDLORD':
            default: return "Propriétaire Titulaire";
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
        <div className="flex bg-[var(--ci-nuit)] min-h-screen relative overflow-hidden font-sans text-white admin-wrapper">
            {/* Visual Mesh Background Fix pour Portal */}
            <div className="fixed inset-0 pointer-events-none z-0 mix-blend-screen opacity-40">
                <div className="absolute inset-0 bg-[url('/mesh-dark.svg')] bg-cover bg-center"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[var(--ci-vert)] opacity-[0.03] blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--ci-or)] opacity-[0.03] blur-[120px]"></div>
            </div>

            {/* Sidebar Injection */}
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

            <main className="main-content flex-1 max-w-[100vw] lg:max-w-[calc(100vw-300px)] min-h-screen flex flex-col z-10 transition-all duration-300 relative lg:ml-[300px]">
                {/* Onyx Topbar */}
                <div className="topbar">
                    <div className="topbar-search">
                        <Search size={18} className="text-gray-500" />
                        <input type="text" placeholder="Rechercher un logement, bail, dossier..." />
                    </div>

                    <div className="topbar-actions">
                        <Link href="/dashboard" className="flex lg:hidden items-center group mr-auto">
                            <ProtectedLogo 
                                src="/logo-white.png" 
                                alt="QAPRIL Logo" 
                                className="h-8 w-auto group-hover:scale-105 transition-transform duration-700 brightness-0 invert" 
                            />
                        </Link>
                        
                        <div className="date-badge hidden md:flex items-center gap-2">
                            {getDashboardTitle()}
                        </div>
                        
                        <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                            <NotificationCenter />
                        </div>

                        {session?.user && (
                            <div className="topbar-user">
                                <div className="text-right hidden sm:block">
                                    <div className="u-name">{(session.user.firstName ? session.user.firstName + " " : "") + (session.user.lastName || "") || session.user.email?.split('@')[0]}</div>
                                    <div className="u-role">{getRoleBadge()}</div>
                                </div>
                                <div className="u-avatar">
                                    <User size={18} className="text-[var(--ci-vert)]" />
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="ml-2 flex items-center justify-center w-10 h-10 bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30 group"
                                    title="Déconnexion"
                                >
                                    <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        )}

                        <div className="flex xl:hidden text-white ml-4">
                            <MobileMenu 
                                links={navLinks} 
                                session={session} 
                                variant="dark" 
                                onLogout={() => signOut()}
                                activeRole={activeRole} 
                            />
                        </div>
                    </div>
                </div>

                {/* Animated Content Wrapper */}
                <div className="p-8 lg:p-12 overflow-y-auto overflow-x-hidden relative h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
                
                {/* Mobile Bottom Nav */}
                {session?.user && (
                    <BottomNav items={[
                        ...navLinks, 
                        ...((session.user.eligibleRoles?.length > 1 || (session.user as any).capacites?.length > 1)
                            ? [{ href: "/auth/choose-role", label: "Profils", icon: <User size={24} /> }] 
                            : []),
                        { label: "Quitter", icon: <LogOut size={24} />, onClick: () => handleLogout() }
                    ]} />
                )}
            </main>
        </div>
    )
}
