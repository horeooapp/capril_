/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from 'react'
import Link from 'next/link'

interface NavLink {
    href: string
    label: string
    icon?: React.ReactNode
}

interface Session {
    user: {
        id?: string | null;
        email?: string | null;
        role?: string | null;
    };
}

interface MobileMenuProps {
    links: NavLink[]
    session?: Session | null
    logoSrc?: string
    brandName?: string
    variant?: 'light' | 'dark' | 'primary'
    onLogout?: () => Promise<void> | void
}

export default function MobileMenu({ 
    links, 
    session, 
    logoSrc = "/logo.png", 
    brandName = "QAPRIL", 
    variant = 'light',
    onLogout 
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    const variantStyles = {
        light: {
            button: "text-gray-900 hover:text-primary",
            menu: "bg-white text-gray-900",
            link: "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
            activeLink: "bg-primary/10 text-primary font-bold",
            border: "border-gray-100",
            footer: "bg-gray-50/50"
        },
        dark: {
            button: "text-white/80 hover:text-white",
            menu: "bg-gray-900 text-white",
            link: "text-gray-400 hover:bg-white/5 hover:text-white",
            activeLink: "bg-white/10 text-white font-bold",
            border: "border-white/5",
            footer: "bg-black/20"
        },
        primary: {
            button: "text-white/80 hover:text-white",
            menu: "bg-primary text-white",
            link: "text-white/80 hover:bg-white/10 hover:text-white",
            activeLink: "bg-white/20 text-white font-bold",
            border: "border-white/10",
            footer: "bg-black/10"
        }
    }

    const s = variantStyles[variant]

    return (
        <div className="xl:hidden flex items-center">
            <button 
                onClick={toggleMenu}
                className={`p-2.5 rounded-2xl ${s.button} transition-all active:scale-90 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none`}
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
                    </svg>
                )}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-500 animate-in fade-in"
                    onClick={toggleMenu}
                ></div>
            )}

            {/* Menu Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[310px] ${s.menu} shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[101] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`p-8 flex items-center justify-between border-b ${s.border}`}>
                        <div className="flex items-center space-x-3">
                            <img src={logoSrc} alt="Logo" className="h-10 w-auto" />
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter uppercase leading-none">{brandName}</span>
                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary mt-0.5">Navigation</span>
                            </div>
                        </div>
                        <button 
                            onClick={toggleMenu} 
                            className={`${s.button} p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all`}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        {links.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${s.link}`}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">
                                    {link.icon || <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / User Space */}
                    <div className={`p-6 border-t ${s.border} ${s.footer}`}>
                        {session?.user ? (
                            <div className="space-y-4">
                                <div className="px-5 py-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
                                    <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider mb-1">Identité</p>
                                    <p className="text-xs font-bold truncate text-gray-900 dark:text-white">{session.user.email}</p>
                                    <div className="mt-2 flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">{session.user.role}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link 
                                        href={session.user.role === 'TENANT' ? "/locataire" : "/dashboard"}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                                    >
                                        Espace
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setIsOpen(false);
                                            if (onLogout) onLogout();
                                        }}
                                        className="flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95"
                                    >
                                        Quitter
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link 
                                    href="/locataire/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-white border border-gray-100 text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Accès Locataire
                                </Link>
                                <Link 
                                    href="/dashboard/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Accès Propriétaire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
