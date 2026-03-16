"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import ProtectedLogo from "@/components/ProtectedLogo"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import MobileMenu from "@/components/MobileMenu"
import { signOut } from "next-auth/react"

export default function DashboardLayoutClient({
    children,
    session,
}: {
    children: React.ReactNode
    session: any
}) {
    const pathname = usePathname()

    const navLinks = [
        { href: "/dashboard", label: "Vue d'ensemble", icon: "📊" },
        { href: "/dashboard/properties", label: "Logements", icon: "🏢" },
        { href: "/dashboard/leases", label: "Contrats", icon: "📋" },
        { href: "/dashboard/receipts", label: "Quittances", icon: "📜" },
        { href: "/dashboard/mandates", label: "Mandats", icon: "🤝" },
        { href: "/dashboard/trust", label: "Mon ICL", icon: "⭐" },
    ];

    return (
        <div className="min-h-screen bg-mesh flex flex-col relative">
            <div className="bg-ivory-pattern"></div>
            
            {/* Ultra Premium Floating Header */}
            <header className="sticky top-6 z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="glass-panel h-20 px-8 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center space-x-4 group">
                            <div className="relative">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-12 w-auto group-hover:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute -inset-2 bg-orange-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-2xl tracking-tighter text-gray-900 leading-none">QAPRIL</span>
                                <span className="label-tech mt-1 text-orange-600/70">PORTAIL GESTION</span>
                            </div>
                        </Link>

                        <nav className="hidden xl:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link 
                                        key={link.href} 
                                        href={link.href}
                                        className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                                            isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-white shadow-sm rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <span>{link.icon}</span>
                                            {link.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex xl:hidden">
                            <MobileMenu 
                                links={navLinks} 
                                session={session} 
                                variant="light" 
                                onLogout={() => signOut({ callbackUrl: "/" })} 
                            />
                        </div>

                        <div className="hidden md:flex items-center gap-4 pr-6 border-r border-gray-100">
                            <NotificationCenter />
                            {session?.user && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black tracking-widest text-gray-900 line-clamp-1 max-w-[150px]">{session.user.name || session.user.email}</span>
                                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter">{session.user.role}</span>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="hidden md:flex p-3 bg-gray-900 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-gray-200 active:scale-95 group"
                            title="Déconnexion"
                        >
                            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4-4H7m6 4v1h8M7 4h10M7 20h10" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content with Entry Animations */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}
