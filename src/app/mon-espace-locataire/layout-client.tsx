"use client"

import React from "react"
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
            <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden font-bodoni">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
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
                {/* Header removed per user request for cleaner UI */}

                {/* Main Content */}
                <main className={session ? "flex-1 w-full max-w-7xl mx-auto pt-12 pb-32 px-4 sm:px-6 lg:px-8" : "flex-1"}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={session ? "authenticated" : "public"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>

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
