"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    LayoutDashboard, Building2, ClipboardList, FileText, Handshake, Star, Bot, Trophy, Globe,
    LogOut, Home, User, BarChart3, Settings, Zap, ShieldAlert, Receipt, Wallet, BookOpen, 
    Users, Shield, Scale, Store, FileSignature, LineChart, CreditCard, Landmark, Calculator, 
    Wrench, MapPin, HardDriveUpload, SmartphoneNfc, MessageSquareWarning, BarChartHorizontal, Megaphone
} from "lucide-react"

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
                { href: "/mon-espace-locataire", label: "Accueil", icon: <LayoutDashboard /> },
                { href: "/mon-espace-locataire/leases", label: "Mon bail", icon: <FileText /> },
                { href: "/mon-espace-locataire/receipts", label: "Quittances", icon: <Receipt /> },
                { href: "/mon-espace-locataire/cie-sodeci", label: "CIE / SODECI", icon: <Zap /> },
                { href: "/mon-espace-locataire/profil-public", label: "Matching Immo", icon: <Handshake /> },
                { href: "/mon-espace-locataire/rights", label: "Mes droits", icon: <ShieldAlert /> },
                { href: "/mon-espace-locataire/profile", label: "Profil", icon: <User /> },
                { href: "/mon-espace-locataire/manual", label: "Manuel Officiel", icon: <BookOpen /> },
            ]
        }
        
        if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY'].includes(role)) {
            const isManager = agencyConfig?.isManager !== false
            const perms = agencyConfig?.permissions || []

            const allLinks = [
                { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard />, id: "READ_DASHBOARD" },
                { href: "/dashboard/matching", label: "Candidats", icon: <User />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/properties", label: "Patrimoine", icon: <Building2 />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/mandates", label: "Mandats", icon: <ClipboardList />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/receipts", label: "Comptabilité", icon: <FileText />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/insurance", label: "Assurances", icon: <Shield />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/succession", label: "Successions", icon: <Users />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/disputes", label: "Contentieux", icon: <Scale />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store />, id: "READ_DASHBOARD" },
                { href: "/dashboard/syndication", label: "Syndicateur Web", icon: <Megaphone />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/procurations", label: "Délégations", icon: <FileSignature />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/billing", label: "Abonnements", icon: <CreditCard />, id: "SETTINGS" },
                { href: "/dashboard/fiscal", label: "Fiscalité", icon: <Landmark />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/providers", label: "Prestataires", icon: <Wrench />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/inspections", label: "Inspections", icon: <MapPin />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/import", label: "Import CSV", icon: <HardDriveUpload />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/bdq", label: "Baux Déclaratifs", icon: <SmartphoneNfc />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/mediation", label: "Médiations", icon: <MessageSquareWarning />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/crm", label: "Leads CRM", icon: <BarChartHorizontal />, id: "READ_DASHBOARD" },
                { href: "/dashboard/reports", label: "Rapports CRG", icon: <FileText />, id: "READ_DASHBOARD" },
                { href: "/dashboard/trust", label: "Coffre CDC-CI", icon: <ShieldAlert />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/automations", label: "Automatisations", icon: <Bot />, id: "SETTINGS" },
                { href: "/dashboard/communications", label: "News Ticker", icon: <Megaphone />, id: "SETTINGS" },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings />, id: "SETTINGS" },
                { href: "/dashboard/moderation", label: "Modération", icon: <ShieldAlert />, id: "SETTINGS" },
                { href: "/dashboard/observatory", label: "Observatoire", icon: <LineChart />, id: "READ_DASHBOARD" },
                { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen />, id: "MANUAL" },
                ...(isManager ? [{ href: "/dashboard/team", label: "Mon Équipe", icon: <Users />, id: "TEAM" }] : [])
            ]

            return allLinks.filter(l => isManager || ["SETTINGS", "MANUAL"].includes(l.id) || perms.includes(l.id))
        }
        
        return [
            { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard /> },
            { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet /> },
            { href: "/dashboard/properties", label: "Logements", icon: <Building2 /> },
            { href: "/dashboard/leases", label: "Contrats", icon: <ClipboardList /> },
            { href: "/dashboard/receipts", label: "Quittances", icon: <FileText /> },
            { href: "/dashboard/insurance", label: "Assurances", icon: <Shield /> },
            { href: "/dashboard/succession", label: "Successions", icon: <Users /> },
            { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 /> },
            { href: "/dashboard/disputes", label: "Contentieux", icon: <Scale /> },
            { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store /> },
            { href: "/dashboard/procurations", label: "Procurations", icon: <FileSignature /> },
            { href: "/dashboard/billing", label: "Abonnements", icon: <CreditCard /> },
            { href: "/dashboard/fiscal", label: "Fiscalité", icon: <Landmark /> },
            { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator /> },
            { href: "/dashboard/providers", label: "Prestataires", icon: <Wrench /> },
            { href: "/dashboard/inspections", label: "Inspections", icon: <MapPin /> },
            { href: "/dashboard/bdq", label: "Bail Déclaratif", icon: <SmartphoneNfc /> },
            { href: "/dashboard/mediation", label: "Médiation", icon: <MessageSquareWarning /> },
            { href: "/dashboard/reports", label: "Rapports", icon: <FileText /> },
            { href: "/dashboard/automations", label: "Relances", icon: <Bot /> },
            { href: "/dashboard/communications", label: "Alertes", icon: <Megaphone /> },
            { href: "/dashboard/profile", label: "Profil", icon: <User /> },
            { href: "/dashboard/matching", label: "Matching", icon: <Handshake /> },
            { href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 /> },
            { href: "/dashboard/icl", label: "Indice ICL", icon: <Star /> },
            { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot /> },
            ...(role === 'CHAMPION' ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy /> }] : []),
            ...(diasporaAbonnement || role === 'DIASPORA' ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe /> }] : []),
            { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen /> },
        ]
    }

    const navLinks = getNavLinks()

    return (
        <div className="sidebar z-[60] hidden lg:flex flex-col h-screen fixed inset-y-0 left-0 hover:overflow-y-auto no-scrollbar">
            <Link href={role === 'TENANT' ? "/mon-espace-locataire" : "/dashboard"} className="logo" style={{ textDecoration: 'none' }}>
                <div className="logo-mark">Q</div>
                <div>
                    <div className="logo-text">qapril</div>
                    <span className="logo-sub">
                        {role === 'TENANT' ? 'Locataire' 
                         : role === 'DIASPORA' ? 'Diaspora'
                         : role === 'INTERMEDIARY' ? 'Intermédiaire'
                         : role === 'CHAMPION' ? 'Champion'
                         : ['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(role) ? 'Agence' 
                         : ['NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(role) ? 'Gestionnaire' 
                         : 'Propriétaire'}
                    </span>
                </div>
            </Link>

            <nav className="nav flex-1">
                <div className="nav-section">Raccourcis</div>
                <Link href="/" className="nav-item text-[12px]">
                    <Home size={16} className="nav-icon" /> Accueil Public
                </Link>

                <div className="nav-section">Espace de Travail</div>
                {navLinks.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`nav-item text-[12px] ${isActive ? "active" : ""}`}
                        >
                            <div className="nav-icon flex items-center justify-center text-current">
                                {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
                            </div>
                            {item.label}
                        </Link>
                    )
                })}

                <div className="nav-section">Accès & Paramètres</div>
                {eligibleRoles && eligibleRoles.length > 1 && (
                    <Link href="/auth/choose-role" className="nav-item text-[12px]">
                        <div className="nav-icon"><User size={16} /></div> Changer de Profil
                    </Link>
                )}
                {(role === 'LANDLORD' || role === 'AGENCY' || role === 'CHAMPION') && (
                    <Link href="/onboarding" className="nav-item text-[12px]" style={{ color: 'var(--ci-or)' }}>
                        <div className="nav-icon"><Building2 size={16} /></div> Ajouter une Casquette
                    </Link>
                )}
                <div className="nav-item text-[12px] cursor-pointer" onClick={onLogout} style={{ color: 'var(--ci-orange)' }}>
                    <div className="nav-icon"><LogOut size={16} /></div> Déconnexion
                </div>
            </nav>

            <div className="sidebar-bottom">
                <div className="user-mini">
                    <div className="user-avatar bg-[var(--ci-vert)]">
                        {userName ? userName.substring(0, 2).toUpperCase() : 'QC'}
                    </div>
                    <div className="user-info">
                        <p className="truncate w-[120px]">{userName || 'Compte Certifié'}</p>
                        <span>QAPRIL Portal V4</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
