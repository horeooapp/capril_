"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Receipt, Building2, Bell, User } from 'lucide-react'

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

    const defaultItems: BottomNavItem[] = [
        { href: "/dashboard", label: "Accueil", icon: <Home size={24} /> },
        { href: "/dashboard/payments", label: "Payer", icon: <Receipt size={24} /> },
        { href: "/dashboard/properties", label: "Mes biens", icon: <Building2 size={24} /> },
        { href: "/dashboard/alerts", label: "Alertes", icon: <Bell size={24} /> },
        { href: "/account", label: "Compte", icon: <User size={24} /> },
    ]

    const navItems = items || defaultItems

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
            <div className="bg-white/80 backdrop-blur-2xl border-t border-gray-100 flex items-center justify-between px-6 pb-8 pt-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] gap-2">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    
                    const content = (
                        <>
                            {isActive && (
                                <motion.div 
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 bg-[#D6E4F0] rounded-2xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={`${isActive ? "scale-110" : "scale-100"} transition-transform`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-60"}`}>
                                {item.label}
                            </span>
                        </>
                    )

                    if (item.onClick) {
                        return (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all relative shrink-0 text-red-500 font-bold"
                            >
                                {content}
                            </button>
                        )
                    }

                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all relative shrink-0 min-w-[60px] ${
                                isActive ? "text-[#1F4E79]" : "text-gray-400"
                            }`}
                        >
                            {content}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
