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
    Users,
    Shield,
    Scale,
    Store,
    FileSignature,
    LineChart,
    CreditCard,
    Landmark,
    Calculator,
    Wrench,
    MapPin,
    HardDriveUpload,
    SmartphoneNfc,
    MessageSquareWarning,
    BarChartHorizontal,
    Megaphone
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"

interface AppSidebarProps {
    role: 'ADMIN' | 'SUPER_ADMIN' | 'TENANT' | 'LANDLORD' | 'CHAMPION' | 'AGENCY' | 'NON_CERTIFIED_AGENT' | 'INTERMEDIARY' | 'DIASPORA' | 'AGENCE_AGREE' | 'AGENCE_NON_AGREE' | 'AGENCY_AGREE' | 'AGENCY_NON_AGREE'
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
                { href: "/mon-espace-locataire", label: "Accueil", icon: <LayoutDashboard size={20} /> },
                { href: "/mon-espace-locataire/leases", label: "Mon bail", icon: <FileText size={20} /> },
                { href: "/mon-espace-locataire/receipts", label: "Quittances", icon: <Receipt size={20} /> },
                { href: "/mon-espace-locataire/cie-sodeci", label: "CIE / SODECI", icon: <Zap size={20} /> },
                { href: "/mon-espace-locataire/profil-public", label: "Matching Immo", icon: <Handshake size={20} /> },
                { href: "/mon-espace-locataire/rights", label: "Mes droits", icon: <ShieldAlert size={20} /> },
                { href: "/mon-espace-locataire/profile", label: "Profil", icon: <User size={20} /> },
                { href: "/mon-espace-locataire/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
            ]
        }
        
        if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY'].includes(role)) {
            const isManager = agencyConfig?.isManager !== false // Default to manager if undefined to prevent locking out legacy users
            const perms = agencyConfig?.permissions || []

            const allLinks = [
                { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={20} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/matching", label: "Candidats", icon: <User size={20} />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/properties", label: "Patrimoine", icon: <Building2 size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList size={20} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/receipts", label: "Comptabilité", icon: <FileText size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/insurance", label: "Assurances", icon: <Shield size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/succession", label: "Successions", icon: <Users size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/disputes", label: "Contentieux", icon: <Scale size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store size={20} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/syndication", label: "Syndicateur Web", icon: <Megaphone size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/procurations", label: "Délégations", icon: <FileSignature size={20} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/billing", label: "Abonnements", icon: <CreditCard size={20} />, id: "SETTINGS" },
                { href: "/dashboard/fiscal", label: "Fiscalité", icon: <Landmark size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/providers", label: "Prestataires", icon: <Wrench size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/inspections", label: "Inspections", icon: <MapPin size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/import", label: "Import CSV", icon: <HardDriveUpload size={20} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/bdq", label: "Baux Déclaratifs", icon: <SmartphoneNfc size={20} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/mediation", label: "Médiations", icon: <MessageSquareWarning size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/crm", label: "Leads CRM", icon: <BarChartHorizontal size={20} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/reports", label: "Rapports CRG", icon: <FileText size={20} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/trust", label: "Coffre CDC-CI", icon: <ShieldAlert size={20} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/automations", label: "Automatisations", icon: <Bot size={20} />, id: "SETTINGS" },
                { href: "/dashboard/communications", label: "News Ticker", icon: <Megaphone size={20} />, id: "SETTINGS" },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings size={20} />, id: "SETTINGS" },
                { href: "/dashboard/moderation", label: "Modération", icon: <ShieldAlert size={20} />, id: "SETTINGS" },
                { href: "/dashboard/observatory", label: "Observatoire", icon: <LineChart size={20} />, id: "READ_DASHBOARD" },
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
            { href: "/dashboard/insurance", label: "Assurances", icon: <Shield size={20} /> },
            { href: "/dashboard/succession", label: "Successions", icon: <Users size={20} /> },
            { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 size={20} /> },
            { href: "/dashboard/disputes", label: "Contentieux", icon: <Scale size={20} /> },
            { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store size={20} /> },
            { href: "/dashboard/procurations", label: "Procurations", icon: <FileSignature size={20} /> },
            { href: "/dashboard/billing", label: "Abonnements", icon: <CreditCard size={20} /> },
            { href: "/dashboard/fiscal", label: "Fiscalité", icon: <Landmark size={20} /> },
            { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator size={20} /> },
            { href: "/dashboard/providers", label: "Prestataires", icon: <Wrench size={20} /> },
            { href: "/dashboard/inspections", label: "Inspections", icon: <MapPin size={20} /> },
            { href: "/dashboard/bdq", label: "Bail Déclaratif", icon: <SmartphoneNfc size={20} /> },
            { href: "/dashboard/mediation", label: "Médiation", icon: <MessageSquareWarning size={20} /> },
            { href: "/dashboard/reports", label: "Rapports", icon: <FileText size={20} /> },
            { href: "/dashboard/automations", label: "Relances", icon: <Bot size={20} /> },
            { href: "/dashboard/communications", label: "Alertes", icon: <Megaphone size={20} /> },
            { href: "/dashboard/profile", label: "Profil", icon: <User size={20} /> },
            { href: "/dashboard/matching", label: "Matching", icon: <Handshake size={20} /> },
            { href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={20} /> },
            { href: "/dashboard/icl", label: "Indice ICL", icon: <Star size={20} /> },
            { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot size={20} /> },
            ...(role === 'CHAMPION' ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy size={20} /> }] : []),
            ...(diasporaAbonnement || role === 'DIASPORA' ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={20} /> }] : []),
            { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen size={20} /> },
        ]

        return commonLinks;
    }

    const navLinks = getNavLinks()

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-[60] hidden lg:block">
            <div className="h-full bg-qnavy border-r border-qnavy-light shadow-[4px_0_24px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative">
                {/* Brand Logo Section */}
                <div className="p-8 shrink-0 flex items-center justify-between border-b border-white/5">
                    <Link href={role === 'TENANT' ? "/mon-espace-locataire" : "/dashboard"} className="flex flex-col gap-2 group">
                        <div className="bg-white/90 p-2 rounded-xl inline-block group-hover:scale-105 transition-transform">
                            <ProtectedLogo 
                                src="/logo.png" 
                                alt="QAPRIL" 
                                className="h-8 w-auto mix-blend-multiply" 
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="bg-qgreen rounded-md px-2 py-0.5 text-[9px] font-black text-white tracking-[0.15em] uppercase text-nowrap">
                                {role === 'TENANT' ? 'Espace Locataire' 
                                 : role === 'DIASPORA' ? 'Console Diaspora'
                                 : role === 'INTERMEDIARY' ? 'Console Intermédiaire'
                                 : role === 'CHAMPION' ? 'Console Champion'
                                 : ['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(role) ? 'Console Agence' 
                                 : ['NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(role) ? 'Console Gestionnaire' 
                                 : 'Console Propriétaire'}
                            </div>
                            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-qgreen-light" />
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 no-scrollbar">
                    {/* Public Home Link */}
                    <Link 
                        href="/"
                        className="relative group flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all text-white/50 hover:text-qgold hover:bg-white/5 border border-dashed border-white/10 hover:border-qgold/30 mt-6 mb-6"
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
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-[#FF8B00]/15 shadow-[inset_4px_0_0_#FF8B00] rounded-r-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-transform ${isActive ? "scale-110 text-[#FF8B00]" : "group-hover:translate-x-1"}`}>
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
                <div className="p-6 mt-auto border-t border-white/5 bg-black/10">
                    {eligibleRoles && eligibleRoles.length > 1 && (
                        <Link 
                            href="/auth/choose-role"
                            className="w-full h-10 mb-2 bg-white/5 text-white border border-white/10 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 group shadow-sm"
                        >
                            <User size={14} className="group-hover:scale-110 transition-transform" />
                            Changer de Profil
                        </Link>
                    )}
                    {(role === 'LANDLORD' || role === 'AGENCY' || role === 'CHAMPION') && (
                        <Link 
                            href="/onboarding"
                            className="w-full h-10 mb-2 bg-white/5 text-qgold border border-qgold/20 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest hover:bg-qgold/10 transition-all active:scale-95 group shadow-sm"
                        >
                            <Building2 size={14} className="group-hover:scale-110 transition-transform" />
                            Ajouter une Casquette
                        </Link>
                    )}
                    <button 
                        onClick={onLogout}
                        className="w-full h-12 bg-white/5 text-qred-pale border border-qred/20 rounded-xl flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest hover:bg-qred hover:text-white hover:border-transparent transition-all active:scale-95 group shadow-sm"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                    
                    <div className="mt-5 text-center">
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                            QAPRIL Portal V4 <br/>
                            <span className="opacity-70 text-white/80">{userName || 'Compte Certifié'}</span>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
