"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
    Home, 
    LogOut, 
    User, 
    LayoutDashboard, 
    Building2, 
    ClipboardList, 
    FileText, 
    Receipt, 
    Zap, 
    Store, 
    Handshake, 
    Wrench, 
    ShieldAlert, 
    BookOpen, 
    Settings, 
    Wallet, 
    CalendarDays, 
    MessageSquare, 
    Scale, 
    Users, 
    Landmark,
    X,
    Menu,
    ChevronRight,
    ArrowLeft,
    Download,
    Smartphone,
    Share,
    PlusSquare,
    CheckCircle2
} from 'lucide-react'
import RoleSwitcher from './dashboard/RoleSwitcher'
import { PWA_ROLES, PwaRoleId, resolvePwaRole } from './pwa/pwa-roles'
import { usePwaInstall } from './pwa/usePwaInstall'

export interface NavLink {
    href: string
    label: string
    icon?: React.ReactNode
}

interface Session {
    user: {
        id?: string | null;
        email?: string | null;
        role?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        eligibleRoles?: string[] | null;
        chosenRole?: string | null;
    };
}

interface MobileMenuProps {
    links?: NavLink[]
    session?: Session | null
    logoSrc?: string
    brandName?: string
    variant?: 'light' | 'dark' | 'primary'
    onLogout?: () => Promise<void> | void
    activeRole?: string | null
}

export default function MobileMenu({ 
    links, 
    session, 
    logoSrc = "/logo.png", 
    brandName = "QAPRIL", 
    variant = 'dark',
    onLogout,
    activeRole
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showIosGuide, setShowIosGuide] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { isStandalone, isIos, triggerInstall } = usePwaInstall()

    const displayRole = activeRole || session?.user?.chosenRole || session?.user?.role || 'CLIENT';
    const currentPwaRole = resolvePwaRole(displayRole, pathname)
    const currentRoleConfig = PWA_ROLES[currentPwaRole] || PWA_ROLES.landlord

    const toggleMenu = () => {
        setIsOpen(!isOpen)
        setShowIosGuide(false)
    }

    const handleInstallClick = async () => {
        const res = await triggerInstall(currentPwaRole)
        if (res === 'ios') {
            setShowIosGuide(true)
        } else if (res === 'accepted') {
            setIsOpen(false)
        }
    }

    // Si aucun lien n'est fourni, générer les liens complets selon le rôle actif
    const getComputedLinks = (): NavLink[] => {
        if (links && links.length > 0) return links;

        if (displayRole === 'TENANT' || displayRole === 'LOCATAIRE') {
            return [
                { href: "/mon-espace-locataire", label: "Mon Logement", icon: <LayoutDashboard size={18} /> },
                { href: "/mon-espace-locataire/receipts", label: "Mes Loyers & Quittances", icon: <Receipt size={18} /> },
                { href: "/mon-espace-locataire/leases", label: "Documents & Baux", icon: <FileText size={18} /> },
                { href: "/mon-espace-locataire/cie-sodeci", label: "Factures CIE / SODECI", icon: <Zap size={18} /> },
                { href: "/mon-espace-locataire/marketplace", label: "Marketplace QAPRIL", icon: <Store size={18} /> },
                { href: "/mon-espace-locataire/profil-public", label: "Matching Locatif", icon: <Handshake size={18} /> },
                { href: "/mon-espace-locataire/rights", label: "Signalements & Litiges", icon: <Wrench size={18} /> },
                { href: "/mon-espace-locataire/cautions", label: "Caution CDC", icon: <ShieldAlert size={18} /> },
                { href: "/mon-espace-locataire/profile", label: "Mon Profil", icon: <User size={18} /> },
                { href: "/mon-espace-locataire/manual", label: "Guide & Manuel", icon: <BookOpen size={18} /> },
            ];
        }

        if (['INTERMEDIARY', 'INTERMEDIAIRE', 'CHAMPION', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(displayRole)) {
            return [
                { href: "/dashboard", label: "Vue Synthèse", icon: <LayoutDashboard size={18} /> },
                { href: "/dashboard/mandates", label: "Mandats Prospection", icon: <ClipboardList size={18} /> },
                { href: "/dashboard/matching", label: "Candidatures Locataires", icon: <User size={18} /> },
                { href: "/dashboard/marketplace", label: "Marketplace & Annonces", icon: <Store size={18} /> },
                { href: "/dashboard/properties", label: "Biens Confiés", icon: <Building2 size={18} /> },
                { href: "/dashboard/agenda", label: "Visites & Agenda", icon: <CalendarDays size={18} /> },
                { href: "/dashboard/communications", label: "Messagerie", icon: <MessageSquare size={18} /> },
                { href: "/dashboard/receipts", label: "Mes Commissions", icon: <Receipt size={18} /> },
                { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={18} /> },
                { href: "/dashboard/profile", label: "Paramètres Profil", icon: <Settings size={18} /> },
                { href: "/dashboard/manual", label: "Manuel Démarcheur", icon: <BookOpen size={18} /> },
            ];
        }

        if (['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(displayRole)) {
            return [
                { href: "/dashboard", label: "Tableau de Bord", icon: <LayoutDashboard size={18} /> },
                { href: "/dashboard/mandates", label: "Mandats Gestion", icon: <ClipboardList size={18} /> },
                { href: "/dashboard/properties", label: "Biens en Gestion", icon: <Building2 size={18} /> },
                { href: "/dashboard/leases", label: "Baux & Contrats", icon: <FileText size={18} /> },
                { href: "/dashboard/agenda", label: "Agenda & Visites", icon: <CalendarDays size={18} /> },
                { href: "/dashboard/matching", label: "Candidatures", icon: <User size={18} /> },
                { href: "/dashboard/receipts", label: "Comptabilité & Quittances", icon: <Receipt size={18} /> },
                { href: "/dashboard/wallet", label: "Wallet & Reversements", icon: <Wallet size={18} /> },
                { href: "/dashboard/reports", label: "CRG Mensuels", icon: <FileText size={18} /> },
                { href: "/dashboard/disputes", label: "Contentieux & Alertes", icon: <Scale size={18} /> },
                { href: "/dashboard/team", label: "Mon Équipe", icon: <Users size={18} /> },
                { href: "/dashboard/fiscal", label: "Fiscalité & DGI", icon: <Landmark size={18} /> },
                { href: "/dashboard/profile", label: "Paramètres Agence", icon: <Settings size={18} /> },
                { href: "/dashboard/manual", label: "Manuel Officiel", icon: <BookOpen size={18} /> },
            ];
        }

        // Par défaut : Propriétaire / Bailleur
        return [
            { href: "/dashboard", label: "Vue Synthèse", icon: <LayoutDashboard size={18} /> },
            { href: "/dashboard/properties", label: "Mes Biens & Immeubles", icon: <Building2 size={18} /> },
            { href: "/dashboard/leases", label: "Baux & Contrats", icon: <FileText size={18} /> },
            { href: "/dashboard/receipts", label: "Quittances & Loyers", icon: <Receipt size={18} /> },
            { href: "/dashboard/disputes", label: "Contentieux & Recouvrement", icon: <Scale size={18} /> },
            { href: "/dashboard/matching", label: "Candidatures Locataires", icon: <User size={18} /> },
            { href: "/dashboard/agenda", label: "Agenda & Visites", icon: <CalendarDays size={18} /> },
            { href: "/dashboard/wallet", label: "Mon Wallet", icon: <Wallet size={18} /> },
            { href: "/dashboard/fiscal", label: "Fiscalité & DGI", icon: <Landmark size={18} /> },
            { href: "/dashboard/profile", label: "Paramètres du Compte", icon: <Settings size={18} /> },
            { href: "/dashboard/manual", label: "Guide Propriétaire", icon: <BookOpen size={18} /> },
        ];
    };

    const effectiveLinks = getComputedLinks();

    const getRoleIcon = (roleId: PwaRoleId, size = 15) => {
        switch (roleId) {
            case 'tenant':
                return <Home size={size} />
            case 'landlord':
                return <Building2 size={size} />
            case 'agency':
                return <Landmark size={size} />
            case 'intermediary':
                return <Handshake size={size} />
            default:
                return <Building2 size={size} />
        }
    }

    return (
        <div className="flex items-center">
            {/* Bouton Hamburger déclencheur */}
            <button 
                onClick={toggleMenu}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-90 transition-all focus:outline-none"
                aria-label="Ouvrir le menu mobile"
                title="Menu"
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] transition-opacity duration-300 animate-in fade-in"
                    onClick={toggleMenu}
                />
            )}

            {/* Tiroir Mobile (Drawer) */}
            <aside 
                className={`fixed top-0 right-0 h-full w-[88vw] max-w-[360px] bg-slate-950 text-white shadow-2xl z-[120] transform transition-transform duration-300 ease-out flex flex-col font-sans ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* En-tête du tiroir avec Logo & Fermeture */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
                    <Link 
                        href="/" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 group"
                    >
                        <img src={logoSrc} alt={brandName} className="h-8 w-auto object-contain" />
                        <div>
                            <span className="font-black text-lg tracking-tight uppercase leading-none block text-white">{brandName}</span>
                            <span className="text-[10px] font-bold text-[#FF8200] uppercase tracking-wider block mt-0.5">Portail & Applications</span>
                        </div>
                    </Link>

                    <button 
                        onClick={toggleMenu}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        aria-label="Fermer le menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Bouton Accès Rapide : RETOUR VERS L'ACCUEIL */}
                <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 shrink-0">
                    <Link 
                        href="/" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF8200]/15 to-amber-500/10 hover:from-[#FF8200]/25 hover:to-amber-500/20 border border-[#FF8200]/30 text-amber-200 font-bold text-xs transition-all active:scale-95"
                    >
                        <span className="flex items-center gap-2">
                            <Home size={15} className="text-[#FF8200]" />
                            <span>Retour à la page d'accueil</span>
                        </span>
                        <ChevronRight size={13} className="text-amber-400" />
                    </Link>
                </div>

                {/* BLOC PWA : ACCÈS DIRECT PAR RÔLE & INSTALLATION */}
                <div className="p-3 bg-slate-900/60 border-b border-slate-800 shrink-0 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Smartphone size={13} className="text-[#FF8200]" />
                            <span>Accès Direct par Rôle</span>
                        </span>
                        {isStandalone ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={11} /> App Installée
                            </span>
                        ) : (
                            <span className="text-[10px] font-extrabold text-[#FF8200] uppercase tracking-wider">
                                PWA
                            </span>
                        )}
                    </div>

                    {/* Grille 4 Rôles : Locataire, Propriétaire, Agence, Intermédiaire */}
                    <div className="grid grid-cols-2 gap-1.5">
                        {(Object.keys(PWA_ROLES) as PwaRoleId[]).map((rId) => {
                            const r = PWA_ROLES[rId]
                            const isActive = currentPwaRole === rId
                            return (
                                <Link
                                    key={rId}
                                    href={r.directUrl}
                                    onClick={() => setIsOpen(false)}
                                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all active:scale-95 ${
                                        isActive 
                                            ? `bg-slate-800/90 text-white shadow-sm ${r.borderActive} ring-1 ring-white/10` 
                                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <div 
                                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${r.themeColor}22`, color: r.themeColor }}
                                    >
                                        {getRoleIcon(rId, 13)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold truncate leading-tight">{r.shortLabel}</p>
                                        <span className="text-[9px] text-slate-400 truncate block">Accès direct</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Bouton d'installation de l'application pour le rôle courant */}
                    {!isStandalone && (
                        <div>
                            {showIosGuide ? (
                                <div className="bg-slate-900 rounded-xl p-2.5 text-[11px] text-slate-200 border border-slate-700 space-y-1.5">
                                    <p className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                                        <PlusSquare size={13} /> iPhone/iPad :
                                    </p>
                                    <p className="text-[10px] text-slate-300">
                                        Appuyez sur <Share size={11} className="inline text-sky-400" /> puis <strong>« Sur l'écran d'accueil »</strong>.
                                    </p>
                                    <button 
                                        onClick={() => setShowIosGuide(false)}
                                        className="w-full py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-center"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstallClick}
                                    className={`w-full py-2 px-3 rounded-xl bg-gradient-to-r ${currentRoleConfig.gradient} text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all active:scale-95`}
                                >
                                    <Download size={14} strokeWidth={2.5} />
                                    <span>Installer l'app {currentRoleConfig.shortLabel}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Liste des Liens de Navigation */}
                <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overscroll-contain">
                    <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        Navigation • {displayRole}
                    </p>

                    {effectiveLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                                    isActive 
                                        ? 'bg-[#FF8200] text-slate-950 font-bold shadow-md' 
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={isActive ? 'text-slate-950' : 'text-[#FF8200]'}>
                                        {link.icon || <span className="w-2 h-2 rounded-full bg-[#FF8200]" />}
                                    </span>
                                    <span className="text-[12.5px] font-medium truncate">{link.label}</span>
                                </div>
                                <ChevronRight size={13} className={isActive ? 'text-slate-950' : 'text-slate-600'} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Pied du tiroir : Profil, Rôles et BOUTON DÉCONNEXION */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 space-y-2.5">
                    {session?.user ? (
                        <>
                            {/* Carte Utilisateur */}
                            <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[#FF8200] text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                                        {(session.user.firstName || session.user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate leading-tight">
                                            {session.user.firstName ? `${session.user.firstName} ${session.user.lastName || ''}` : session.user.email}
                                        </p>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                            ● {displayRole}
                                        </span>
                                    </div>
                                </div>

                                <Link 
                                    href={displayRole === 'TENANT' ? "/mon-espace-locataire/profile" : "/dashboard/profile"}
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Mon Profil"
                                >
                                    <Settings size={14} />
                                </Link>
                            </div>

                            {/* Sélecteur de rôle si multi-rôles */}
                            {session.user.eligibleRoles && session.user.eligibleRoles.length > 1 && (
                                <div className="pt-0.5">
                                    <RoleSwitcher 
                                        currentRole={displayRole} 
                                        eligibleRoles={session.user.eligibleRoles} 
                                    />
                                </div>
                            )}

                            {/* BOUTON DÉCONNEXION PLEINE LARGEUR */}
                            <button 
                                onClick={async () => {
                                    setIsOpen(false);
                                    if (onLogout) {
                                        await onLogout();
                                    } else {
                                        window.location.href = '/api/auth/signout';
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                            >
                                <LogOut size={15} />
                                <span>Déconnexion Sécurisée</span>
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Link 
                                href="/dashboard/login"
                                onClick={() => setIsOpen(false)}
                                className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#FF8200] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-amber-500 transition-colors"
                            >
                                Se Connecter
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    )
}
