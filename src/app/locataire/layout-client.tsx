"use client"

import React from "react"
import { motion } from "framer-motion"
import AppSidebar from "@/components/dashboard/AppSidebar"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User, LogOut, FileText, Zap, ShieldAlert, BookOpen } from "lucide-react"

interface LocataireLayoutClientProps {
    children: React.ReactNode
    session: any
    onLogout: () => Promise<void>
}

export default function LocataireLayoutClient({
    children,
    session,
    onLogout
}: LocataireLayoutClientProps) {
    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
            {/* Vertical Sidebar - Only for Desktop */}
            {session?.user && (
                <AppSidebar 
                    role="TENANT" 
                    onLogout={onLogout}
                    userName={session.user.email}
                />
            )}

            <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                {/* Header removed per user request for cleaner UI */}

                {/* Main Content */}
                <main className={session ? "flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8" : "flex-1"}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {children}
                    </motion.div>

                    {session && (
                        <BottomNav items={[
                            { href: "/locataire", label: "Accueil", icon: <Home size={24} /> },
                            { href: "/locataire/leases", label: "Mon bail", icon: <FileText size={24} /> },
                            { href: "/locataire/receipts", label: "Quittances", icon: <Receipt size={24} /> },
                            { href: "/locataire/cie-sodeci", label: "CIE/SODECI", icon: <Zap size={24} /> },
                            { href: "/locataire/rights", label: "Mes droits", icon: <ShieldAlert size={24} /> },
                            { href: "/locataire/preferences", label: "Profil", icon: <User size={24} /> },
                            { href: "/locataire/manual", label: "Manuel", icon: <BookOpen size={24} /> },
                        ]} />
                    )}
                </main>
                
                {/* Footer de courtoisie Premium - Uniquement sur Desktop */}
                {session && (
                    <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100/50 mt-12 mb-24 hidden lg:block">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">© 2024 QAPRIL • Excellence en Gestion Immobilière de Précision</p>
                            <div className="flex gap-8">
                                <span className="text-[14px] font-black text-[#1F4E79] uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity">Support Prioritaire</span>
                                <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity">Mentions Légales</span>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    )
}
