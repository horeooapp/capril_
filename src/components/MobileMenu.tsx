"use client"

import React, { useState } from 'react'
import Link from 'next/link'

interface NavLink {
    href: string
    label: string
    icon?: React.ReactNode
}

interface MobileMenuProps {
    links: NavLink[]
    session?: any
    logoSrc?: string
    brandName?: string
    variant?: 'light' | 'dark' | 'primary'
}

export default function MobileMenu({ links, session, logoSrc = "/logo.png", brandName = "QAPRIL", variant = 'light' }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    const variantStyles = {
        light: {
            button: "text-gray-600 hover:text-gray-900",
            menu: "bg-white text-gray-900",
            link: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            activeLink: "bg-primary/10 text-primary font-bold"
        },
        dark: {
            button: "text-gray-300 hover:text-white",
            menu: "bg-gray-900 text-white",
            link: "text-gray-300 hover:bg-gray-800 hover:text-white",
            activeLink: "bg-white/10 text-white font-bold"
        },
        primary: {
            button: "text-white/80 hover:text-white",
            menu: "bg-primary text-white",
            link: "text-white/80 hover:bg-white/10 hover:text-white",
            activeLink: "bg-white/20 text-white font-bold"
        }
    }

    const s = variantStyles[variant]

    return (
        <div className="xl:hidden lg:hidden flex items-center">
            <button 
                onClick={toggleMenu}
                className={`p-2 rounded-md ${s.button} focus:outline-none transition-colors`}
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
                    onClick={toggleMenu}
                ></div>
            )}

            {/* Menu Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[280px] ${s.menu} shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center space-x-3">
                            <img src={logoSrc} alt="Logo" className="h-10 w-auto" />
                            <span className="font-black text-xl tracking-tight">{brandName}</span>
                        </div>
                        <button onClick={toggleMenu} className={s.button}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {links.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${s.link}`}
                            >
                                {link.icon && <span className="text-xl">{link.icon}</span>}
                                <span className="text-sm font-bold uppercase tracking-wider">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-white/10 space-y-4">
                        {session?.user ? (
                            <div className="space-y-4">
                                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-[10px] uppercase font-black text-gray-400">Connecté en tant que</p>
                                    <p className="text-xs font-bold truncate">{session.user.email}</p>
                                </div>
                                <Link 
                                    href={session.user.role === 'TENANT' ? "/locataire" : "/dashboard"}
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-primary text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    Mon Espace
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link 
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-primary text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    Connexion
                                </Link>
                                <Link 
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center border-2 border-primary text-primary py-3 rounded-xl font-bold text-sm uppercase tracking-widest"
                                >
                                    S&apos;inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
