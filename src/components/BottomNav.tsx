"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Receipt, Building2, Bell, User, Menu, X } from 'lucide-react'

interface BottomNavItem {
    href?: string
    label: string
    icon: React.ReactNode
    onClick?: () => void | Promise<void>
}

interface BottomNavProps {
    items?: BottomNavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    const defaultItems: BottomNavItem[] = [
        { href: "/dashboard", label: "Accueil", icon: <Home size={24} /> },
        { href: "/dashboard/payments", label: "Payer", icon: <Receipt size={24} /> },
        { href: "/dashboard/properties", label: "Mes biens", icon: <Building2 size={24} /> },
        { href: "/dashboard/alerts", label: "Alertes", icon: <Bell size={24} /> },
        { href: "/account", label: "Compte", icon: <User size={24} /> },
    ]

    const navItems = items || defaultItems
    const hasMore = navItems.length > 5
    const coreItems = hasMore ? navItems.slice(0, 4) : navItems
    const moreItems = hasMore ? navItems.slice(4) : []

    const NavItem = ({ item, isActive, isMore = false }: { item: BottomNavItem, isActive: boolean, isMore?: boolean }) => {
        const content = (
            <>
                <div className={`${isActive ? "scale-110 text-slate-800" : "scale-100 text-gray-400"} transition-all duration-300 relative`}>
                    {item.icon}
                    {isActive && (
                        <motion.div 
                            layoutId="nav-glow"
                            className="absolute -inset-2 bg-slate-800/5 blur-lg rounded-full -z-10"
                        />
                    )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest truncate w-full text-center whitespace-nowrap ${isActive ? "text-slate-800 opacity-100" : "text-gray-400 opacity-60"}`}>
                    {item.label}
                </span>
            </>
        )

        const className = `flex flex-col items-center gap-1.5 px-1 py-2 rounded-2xl transition-all relative flex-1 min-w-0 ${isMore ? "p-4 bg-gray-50/50 border border-gray-100/50" : ""}`

        if (item.onClick) {
            return (
                <button
                    onClick={() => { item.onClick?.(); setIsMenuOpen(false); }}
                    className={className}
                >
                    {content}
                </button>
            )
        }

        return (
            <Link 
                href={item.href || '#'}
                onClick={() => setIsMenuOpen(false)}
                className={className}
            >
                {content}
            </Link>
        )
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden safe-bottom">
                <div className="bg-white/95 backdrop-blur-2xl border-t border-gray-100/50 flex items-center justify-around px-4 pb-8 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
                    {coreItems.map((item) => (
                        <NavItem 
                            key={item.label} 
                            item={item} 
                            isActive={pathname === item.href} 
                        />
                    ))}
                    
                    {hasMore && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex flex-col items-center gap-1.5 px-1 py-2 rounded-2xl transition-all relative flex-1 min-w-0 ${isMenuOpen ? "text-slate-800" : "text-gray-400"}`}
                        >
                            <div className="transition-transform duration-300">
                                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                {isMenuOpen ? "Fermer" : "Menu"}
                            </span>
                        </button>
                    )}
                </div>
            </nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-4 bottom-[100px] z-[90] lg:hidden focus:outline-none"
                    >
                        <div className="bg-white/98 backdrop-blur-3xl border border-gray-100 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] p-8 overflow-hidden">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Sections Additionnelles</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {moreItems.map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <NavItem 
                                            item={item} 
                                            isActive={pathname === item.href}
                                            isMore
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[80] lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </>
    )
}
