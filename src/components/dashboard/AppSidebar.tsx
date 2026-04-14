"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
    LayoutDashboard, Building2, ClipboardList, FileText, Handshake, Star, Bot, Trophy, Globe,
    LogOut, Home, User, BarChart3, Settings, Zap, ShieldAlert, Receipt, Wallet, BookOpen, Users,
    Shield, Scale, Store, FileSignature, LineChart, CreditCard, Landmark, Calculator, Wrench,
    MapPin, HardDriveUpload, SmartphoneNfc, MessageSquareWarning, BarChartHorizontal, Megaphone,
    CalendarDays, MessageSquare, FileBadge
} from "lucide-react"

import RoleSwitcher from "./RoleSwitcher"

interface AppSidebarProps {
    role: 'ADMIN' | 'SUPER_ADMIN' | 'TENANT' | 'LANDLORD' | 'CHAMPION' | 'AGENCY' | 'NON_CERTIFIED_AGENT' | 'INTERMEDIARY' | 'DIASPORA' | 'AGENCE_AGREE' | 'AGENCE_NON_AGREE' | 'AGENCY_AGREE' | 'AGENCY_NON_AGREE'
    onLogout: () => void | Promise<void>
    userName?: string | null
    themeId?: 'emerald' | 'amber' | 'sky' | 'violet' | 'slate' | 'rose'
    diasporaAbonnement?: boolean
    agencyConfig?: { isManager?: boolean, permissions?: string[] } | null
    eligibleRoles?: string[]
}

export default function AppSidebar({ role, onLogout, userName, themeId = 'emerald', diasporaAbonnement, agencyConfig, eligibleRoles }: AppSidebarProps) {
    const pathname = usePathname()

    const getNavLinks = () => {
        if (role === 'TENANT') {
            return [
                { href: "/mon-espace-locataire", label: "Mon logement", icon: <LayoutDashboard size={18} /> },
                { href: "/mon-espace-locataire/leases", label: "Documents", icon: <FileText size={18} /> },
                { href: "/mon-espace-locataire/receipts", label: "Mes loyers", icon: <Receipt size={18} /> },
                { href: "/mon-espace-locataire/cie-sodeci", label: "Utilities", icon: <Zap size={18} /> },
                { href: "/mon-espace-locataire/profil-public", label: "Matching Immo", icon: <Handshake size={18} /> },
                { href: "/mon-espace-locataire/rights", label: "Signalements", icon: <Wrench size={18} /> },
                { href: "/mon-espace-locataire/profile", label: "Mon profil", icon: <User size={18} /> },
                { href: "/mon-espace-locataire/cautions", label: "Caution CDC", icon: <ShieldAlert size={18} /> },
                { href: "/mon-espace-locataire/manual", label: "Manuel", icon: <BookOpen size={18} /> },
            ]
        }
        
        if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY'].includes(role)) {
            const isManager = agencyConfig?.isManager !== false 
            const perms = agencyConfig?.permissions || []

            const allLinks = [
                { href: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/mandates", label: "Mandats gestion", icon: <ClipboardList size={18} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/properties", label: "Biens en gestion", icon: <Building2 size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/agenda", label: "Agenda & Visites", icon: <CalendarDays size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/matching", label: "Candidatures", icon: <User size={18} />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/communications", label: "Messagerie", icon: <MessageSquare size={18} />, id: "MANAGE_TENANTS" },
                { href: "/dashboard/receipts", label: "Commissions", icon: <BarChart3 size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/wallet", label: "Wallet & Reversements", icon: <Wallet size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/certificates", label: "Certificats DGI", icon: <FileBadge size={18} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/automations", label: "Automatisations", icon: <Zap size={18} />, id: "SETTINGS" },
                { href: "/dashboard/reports", label: "CRG mensuels", icon: <FileText size={18} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/insurance", label: "Assurances", icon: <Shield size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/succession", label: "Successions", icon: <Users size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/disputes", label: "Contentieux", icon: <Scale size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/marketplace", label: "Annonces", icon: <Store size={18} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/procurations", label: "Délégations", icon: <FileSignature size={18} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/fiscal", label: "Fiscalité & DGI", icon: <Landmark size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/providers", label: "Prestataires", icon: <Wrench size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/inspections", label: "Inspections", icon: <MapPin size={18} />, id: "MANAGE_PROPERTIES" },
                { href: "/dashboard/bdq", label: "Baux Déclaratifs", icon: <SmartphoneNfc size={18} />, id: "MANAGE_MANDATES" },
                { href: "/dashboard/mediation", label: "Médiations", icon: <MessageSquareWarning size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/crm", label: "Leads CRM", icon: <BarChartHorizontal size={18} />, id: "READ_DASHBOARD" },
                { href: "/dashboard/trust", label: "Régularisation", icon: <ShieldAlert size={18} />, id: "MANAGE_ACCOUNTING" },
                { href: "/dashboard/profile", label: "Paramètres", icon: <Settings size={18} />, id: "SETTINGS" },
                { href: "/dashboard/observatory", label: "Observatoire", icon: <LineChart size={18} />, id: "READ_DASHBOARD" },
                ...(isManager ? [{ href: "/dashboard/team", label: "Mon Équipe", icon: <Users size={18} />, id: "TEAM" }] : [])
            ]

            return allLinks.filter(l => isManager || ["SETTINGS", "MANUAL"].includes(l.id) || perms.includes(l.id))
        }
        
        // Default Links (Landlord)
        const commonLinks = [
            { href: "/dashboard", label: "Synthèse", icon: <LayoutDashboard size={18} /> },
            { href: "/dashboard/agenda", label: "Agenda & Visites", icon: <CalendarDays size={18} /> },
            { href: "/dashboard/properties", label: "Mes biens", icon: <Building2 size={18} /> },
            { href: "/dashboard/mandates", label: "Mes mandats", icon: <FileSignature size={18} /> },
            { href: "/dashboard/leases", label: "Mes baux", icon: <ClipboardList size={18} /> },
            { href: "/dashboard/receipts", label: "Loyers", icon: <Receipt size={18} /> },
            { href: "/dashboard/disputes", label: "Impayés", icon: <Scale size={18} /> },
            { href: "/dashboard/inspections", label: "États des lieux", icon: <MapPin size={18} /> },
            { href: "/dashboard/maintenance", label: "Maintenance", icon: <Wrench size={18} /> },
            { href: "/dashboard/communications", label: "Messagerie", icon: <MessageSquare size={18} /> },
            { href: "/dashboard/fiscal", label: "Fiscal DGI", icon: <Landmark size={18} /> },
            { href: "/dashboard/documents", label: "Documents", icon: <FileText size={18} /> },
            { href: "/dashboard/certificates", label: "Certificats", icon: <FileBadge size={18} /> },
            { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={18} /> },
            { href: "/dashboard/insurance", label: "Assurances", icon: <Shield size={18} /> },
            { href: "/dashboard/succession", label: "Successions", icon: <Users size={18} /> },
            { href: "/dashboard/syndic", label: "Syndic", icon: <Building2 size={18} /> },
            { href: "/dashboard/automations", label: "Automatisations", icon: <Zap size={18} /> },
            { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store size={18} /> },
            { href: "/dashboard/procurations", label: "Procurations", icon: <FileSignature size={18} /> },
            { href: "/dashboard/charges", label: "Régul. Charges", icon: <Calculator size={18} /> },
            { href: "/dashboard/import", label: "Outils d'Import", icon: <HardDriveUpload size={18} /> },
            { href: "/dashboard/reports", label: "Rapports", icon: <FileText size={18} /> },
            { href: "/dashboard/profile", label: "Profil", icon: <User size={18} /> },
            { href: "/dashboard/matching", label: "Matching", icon: <Handshake size={18} /> },
            { href: "/dashboard/governance", label: "Gouvernance", icon: <BarChart3 size={18} /> },
            { href: "/dashboard/icl", label: "Indice ICL", icon: <Star size={18} /> },
            { href: "/dashboard/agent", label: "Assistant IA", icon: <Bot size={18} /> },
            ...(role === 'CHAMPION' ? [{ href: "/dashboard/champion", label: "Champions", icon: <Trophy size={18} /> }] : []),
            ...(diasporaAbonnement || role === 'DIASPORA' ? [{ href: "/dashboard/diaspora", label: "Diaspora", icon: <Globe size={18} /> }] : []),
            { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen size={18} /> },
        ]

        return commonLinks;
    }

    const navLinks = getNavLinks()

    const getRoleLabel = () => {
        if (role === 'TENANT') return "LOCATAIRE"
        if (role === 'DIASPORA') return "DIASPORA"
        if (role === 'INTERMEDIARY') return "INTERMÉDIAIRE"
        if (role === 'CHAMPION') return "CHAMPION"
        if (['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(role)) return "AGENCE CERTIFIÉE"
        if (['NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(role)) return "GESTIONNAIRE"
        return "PROPRIÉTAIRE"
    }

    const getThemeIconColor = () => {
        switch (themeId) {
            case 'amber': return "bg-amber-600"
            case 'violet': return "bg-violet-600"
            case 'sky': return "bg-sky-600"
            case 'rose': return "bg-rose-600"
            default: return "bg-emerald-600"
        }
    }

    const getLinkClasses = (isActive: boolean) => {
        if (!isActive) return "text-slate-400 hover:text-slate-200 hover:bg-white/5 font-normal";
        switch (themeId) {
            case 'amber': return "bg-amber-50 text-amber-900 font-semibold";
            case 'violet': return "bg-violet-50 text-violet-900 font-semibold";
            case 'sky': return "bg-sky-50 text-sky-900 font-semibold";
            case 'rose': return "bg-rose-50 text-rose-900 font-semibold";
            default: return "bg-emerald-50 text-emerald-900 font-semibold";
        }
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[220px] z-[60] hidden lg:flex flex-col bg-slate-900 font-sans shadow-xl overflow-hidden">
            {/* Header / Logo */}
            <div className="p-[20px_16px_12px] border-b border-slate-700 shrink-0">
                <Link href={role === 'TENANT' ? "/mon-espace-locataire" : "/dashboard"} className="flex items-center gap-2 group">
                    <div className={`w-8 h-8 rounded-lg ${getThemeIconColor()} flex items-center justify-center text-[14px] font-bold text-white shadow-md group-hover:scale-105 transition-transform`}>
                        Q
                    </div>
                    <div>
                        <div className="text-white font-bold text-[14px] leading-none">QAPRIL</div>
                        <div className="text-slate-400 text-[10px] mt-1 font-medium">{getRoleLabel()}</div>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 no-scrollbar space-y-0.5">
                {navLinks.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[7px] text-[12.5px] transition-colors ${getLinkClasses(isActive)}`}
                        >
                            <span className="opacity-90">{item.icon}</span>
                            <span className="flex-1 leading-none">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800 shrink-0 space-y-2">
                <div className="text-slate-500 text-[10px] flex items-center justify-between">
                    <span>Côte d'Ivoire · FCFA</span>
                </div>
                <RoleSwitcher currentRole={role} eligibleRoles={eligibleRoles || []} />
                <button 
                    onClick={onLogout}
                    className="w-full h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-[6px] flex items-center justify-center gap-2 text-[10px] font-medium transition-colors"
                >
                    <LogOut size={12} />
                    Déconnexion
                </button>
            </div>
        </aside>
    )
}
