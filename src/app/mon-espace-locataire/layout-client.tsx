"use client"

import React from "react"
import Link from "next/link"
import MobileMenu from "@/components/MobileMenu"
import { motion, AnimatePresence } from "framer-motion"
import AppSidebar from "@/components/dashboard/AppSidebar"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User, LogOut, FileText, Zap, ShieldAlert, BookOpen, Handshake, Store } from "lucide-react"

import { SessionProvider } from "next-auth/react"

interface LocataireLayoutClientProps {
    children: React.ReactNode
    session: any
    onLogout: () => Promise<void>
    dbActiveRole?: string
}

export default function LocataireLayoutClient({
    children,
    session,
    onLogout,
    dbActiveRole
}: LocataireLayoutClientProps) {
    const activeRole = dbActiveRole || session?.user?.role;
    return (
        <SessionProvider session={session}>
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-x-hidden">
            {/* Trame architecturale filigrane */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
            <div className="fixed top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />
            
            {/* Vertical Sidebar - Only for Desktop */}
            {session?.user && (
                <AppSidebar 
                    role="TENANT" 
                    onLogout={onLogout}
                    userName={session.user.email}
                    eligibleRoles={session.user.eligibleRoles}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Mobile Header pour Espace Locataire */}
                {session?.user && (
                    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            {/* Bouton Retour Accueil Public */}
                            <Link 
                                href="/" 
                                className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
                                title="Retour à la page d'accueil du site"
                                aria-label="Accueil"
                            >
                                <Home size={18} className="text-[#FF8200]" />
                            </Link>

                            <Link href="/mon-espace-locataire" className="flex items-center gap-2 min-w-0">
                                <img src="/logo.png" alt="QAPRIL" className="h-6 w-auto object-contain" />
                                <div className="min-w-0">
                                    <span className="font-black text-xs uppercase tracking-tight text-slate-900 block leading-tight truncate">Espace Locataire</span>
                                    <span className="text-[10px] font-bold text-emerald-600 block leading-none">Certifié QAPRIL</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Bouton Déconnexion Direct Mobile */}
                            <button 
                                onClick={() => onLogout()}
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs active:scale-95 transition-all"
                                title="Se déconnecter"
                                aria-label="Déconnexion"
                            >
                                <LogOut size={14} />
                                <span className="text-[11px] font-bold">Quitter</span>
                            </button>

                            {/* Menu Mobile Tiroir */}
                            <MobileMenu 
                                session={session} 
                                variant="dark" 
                                onLogout={onLogout}
                                activeRole="TENANT" 
                            />
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className={session ? "flex-1 w-full max-w-7xl mx-auto pt-6 lg:pt-12 pb-32 px-4 sm:px-6 lg:px-8" : "flex-1"}>
                    <div className="w-full">
                        {children}
                    </div>

                    {session && (
                        <BottomNav items={[
                            { href: "/mon-espace-locataire", label: "Accueil", icon: <Home size={24} /> },
                            { href: "/mon-espace-locataire/marketplace", label: "Marketplace", icon: <Store size={24} /> },
                            { href: "/mon-espace-locataire/leases", label: "Bail", icon: <FileText size={20} /> },
                            { href: "/mon-espace-locataire/receipts", label: "Loyers", icon: <Receipt size={24} /> },
                            { href: "/mon-espace-locataire/cie-sodeci", label: "Factures", icon: <Zap size={24} /> },
                            { href: "/mon-espace-locataire/profil-public", label: "Matching", icon: <Handshake size={24} /> },
                            { href: "/mon-espace-locataire/rights", label: "Litiges", icon: <ShieldAlert size={24} /> },
                            { href: "/mon-espace-locataire/profile", label: "Profil", icon: <User size={24} /> },
                            { href: "/mon-espace-locataire/passeport", label: "Passeport", icon: <ShieldAlert size={24} /> },
                            { href: "/mon-espace-locataire/cautions", label: "Caution", icon: <ShieldAlert size={24} /> },
                            { href: "/mon-espace-locataire/manual", label: "Manuel", icon: <BookOpen size={24} /> },
                            ...((session.user.eligibleRoles?.length > 1 || (session.user as any).capacites?.length > 1) 
                                ? [{ href: "/auth/choose-role", label: "Rôles", icon: <User size={24} /> }] 
                                : []),
                            { label: "Déconnexion", icon: <LogOut size={24} />, onClick: () => onLogout() },
                        ]} />
                    )}
                </main>
                
                {/* Footer de courtoisie Premium - Uniquement sur Desktop */}
                {session && (
                    <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100/50 mt-12 mb-24 hidden lg:block">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">© 2024 QAPRIL • Excellence en Gestion Immobilière de Précision</p>
                            <div className="flex gap-8">
                                <span className="text-[14px] font-black text-slate-800 uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity">Support Prioritaire</span>
                                <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity">Mentions Légales</span>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    </SessionProvider>
    )
}
