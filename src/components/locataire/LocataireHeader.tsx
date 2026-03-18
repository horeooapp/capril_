"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, FileText, ClipboardList, Star, LogOut, User } from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import MobileMenu from "@/components/MobileMenu"

interface LocataireHeaderProps {
    session: any
    onLogout: () => Promise<void>
}

export default function LocataireHeader({ session, onLogout }: LocataireHeaderProps) {
    const pathname = usePathname()

    const navLinks = [
        { href: "/", label: "Accueil", icon: <Home size={20} /> },
        { href: "/locataire", label: "Mes Quittances", icon: <FileText size={20} /> },
        { href: "/locataire/leases", label: "Mes Contrats", icon: <ClipboardList size={20} /> },
        { href: "/locataire/trust", label: "Indice de Confiance", icon: <Star size={20} /> },
    ]

    return (
        <header className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-panel rounded-[2rem] border border-white/40 shadow-2xl shadow-gray-200/50 px-6 py-4 flex items-center justify-between"
            >
                <div className="flex items-center gap-8">
                    <Link href="/locataire" className="flex items-center gap-4 group">
                        <ProtectedLogo 
                            src="/logo.png" 
                            alt="QAPRIL Logo" 
                            className="h-12 w-auto rounded-2xl shadow-2xl border border-white/60 group-hover:rotate-3 transition-transform duration-500" 
                        />
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-gray-900 leading-none tracking-tighter uppercase">QAPRIL</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1">Portal Locataire</span>
                        </div>
                    </Link>

                    <nav className="hidden xl:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                        isActive 
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" 
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-nav"
                                            className="absolute inset-0 bg-gray-900 -z-10 rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 bg-white/40 p-1.5 rounded-2xl border border-white/60">
                        <NotificationCenter />
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        {session?.user && (
                            <div className="flex items-center gap-3 pr-3">
                                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Connecté en tant que</span>
                                    <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{session.user.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <form action={async () => { await onLogout() }}>
                            <button type="submit" className="hidden md:flex flex-col items-center justify-center h-12 w-12 rounded-2xl bg-white border border-gray-100 text-red-500 hover:bg-red-50 transition-all shadow-sm group">
                                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </form>
                        <MobileMenu links={navLinks} session={session} variant="light" onLogout={onLogout} />
                    </div>
                </div>
            </motion.div>
        </header>
    )
}
