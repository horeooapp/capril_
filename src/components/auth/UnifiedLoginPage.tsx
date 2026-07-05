"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Building2, ShieldAlert, Sparkles, ShieldCheck, Activity, Server, Fingerprint, Lock } from "lucide-react"
import Link from "next/link"
import EmailOTPForm from "./EmailOTPForm"
import AdminLoginForm from "./AdminLoginForm"

type ProfileTab = 'tenant' | 'landlord' | 'admin'

interface UnifiedLoginPageProps {
    initialTab?: ProfileTab
}

export default function UnifiedLoginPage({ initialTab = 'tenant' }: UnifiedLoginPageProps) {
    const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

    const tabs = [
        {
            id: 'tenant' as ProfileTab,
            label: "Locataire",
            icon: Home,
            color: "from-emerald-500 to-emerald-700",
            textColor: "text-emerald-400",
            activeBg: "bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            inactiveBg: "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent",
            indicator: "bg-emerald-500"
        },
        {
            id: 'landlord' as ProfileTab,
            label: "Propriétaire",
            icon: Building2,
            color: "from-amber-500 to-amber-700",
            textColor: "text-amber-400",
            activeBg: "bg-amber-500/20 border-amber-500/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]",
            inactiveBg: "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent",
            indicator: "bg-amber-500"
        },
        {
            id: 'admin' as ProfileTab,
            label: "Administration",
            icon: ShieldAlert,
            color: "from-[#C55A11] to-[#E87B2E]",
            textColor: "text-[#E87B2E]",
            activeBg: "bg-[#C55A11]/20 border-[#C55A11]/50 text-white shadow-[0_0_20px_rgba(197,90,17,0.3)]",
            inactiveBg: "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent",
            indicator: "bg-[#C55A11]"
        }
    ]

    const backgroundThemes = {
        tenant: {
            bg: "bg-[#021812]",
            gradient: "from-[#021812]/90 via-[#022c22]/80 to-[#064e3b]/90",
            glow1: "bg-emerald-500/20 blur-[120px]",
            glow2: "bg-[#10B981]/20 blur-[150px]",
            tagText: "Expérience Locataire Certifiée",
            tagIconColor: "text-emerald-400",
            badgeColor: "text-emerald-400"
        },
        landlord: {
            bg: "bg-[#0A1128]",
            gradient: "from-[#0A1128]/90 via-[#001f3f]/80 to-[#1F4E79]/90",
            glow1: "bg-amber-600/20 blur-[150px]",
            glow2: "bg-blue-600/20 blur-[150px]",
            tagText: "Accès Distingué & Sécurisé",
            tagIconColor: "text-amber-500",
            badgeColor: "text-amber-500"
        },
        admin: {
            bg: "bg-[#020617]",
            gradient: "from-[#020617]/90 via-[#0B1120]/80 to-[#1e293b]/90",
            glow1: "bg-[#C55A11]/20 blur-[150px]",
            glow2: "bg-blue-600/20 blur-[150px]",
            tagText: "Console d'Administration",
            tagIconColor: "text-[#C55A11]",
            badgeColor: "text-[#C55A11]"
        }
    }

    const currentTheme = backgroundThemes[activeTab]

    return (
        <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-1000`}>
            {/* Arrière-plan dynamique et immersif */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} pointer-events-none transition-all duration-1000 z-0`}></div>
            <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] ${currentTheme.glow1} rounded-full animate-pulse opacity-50 mix-blend-screen pointer-events-none z-0 transition-all duration-1000`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${currentTheme.glow2} rounded-full animate-pulse animation-delay-2000 opacity-50 mix-blend-screen pointer-events-none z-0 transition-all duration-1000`}></div>
            
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none z-0"></div>

            <div className="container mx-auto z-10 flex flex-col items-center w-full max-w-5xl">
                
                {/* En-tête : Logo et Badge officiel */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link href="/" className="group inline-flex flex-col items-center">
                        <img 
                            src="/logo.png" 
                            alt="QAPRIL Logo" 
                            className="h-16 md:h-20 w-auto group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] brightness-0 invert" 
                        />
                    </Link>

                    <motion.div 
                        key={currentTheme.tagText}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-[10px] md:text-xs font-black tracking-widest uppercase text-white shadow-xl shadow-black/20"
                    >
                        <Sparkles className={`w-3.5 h-3.5 ${currentTheme.tagIconColor}`} />
                        <span>{currentTheme.tagText}</span>
                    </motion.div>
                </div>

                {/* Sélecteur de profil tactile et élégant (Pill Tabs) */}
                <div className="w-full max-w-md mb-8 px-2">
                    <div className="flex items-center bg-[#0B1120]/80 backdrop-blur-2xl p-1.5 rounded-3xl border border-white/10 shadow-2xl relative">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-3 px-1 md:px-2 rounded-2xl text-[10px] md:text-sm font-black transition-all duration-300 relative border ${isActive ? tab.activeBg : tab.inactiveBg} ${tab.id === 'admin' ? 'hidden md:flex' : ''}`}
                                    style={{ minHeight: '48px' }}
                                    aria-label={`Connexion profil ${tab.label}`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? '' : tab.textColor}`} />
                                    <span className="tracking-wide">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Zone principale : Formulaire dynamique selon le profil choisi */}
                <div className="w-full max-w-md px-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative"
                        >
                            {activeTab === 'tenant' && (
                                <EmailOTPForm 
                                    role="TENANT"
                                    redirectPath="/mon-espace-locataire"
                                    title="Votre Habitat"
                                    subtitle="Saisissez votre email pour accéder à votre espace locataire sécurisé."
                                />
                            )}
                            
                            {activeTab === 'landlord' && (
                                <EmailOTPForm 
                                    role="LANDLORD"
                                    redirectPath="/dashboard"
                                    title="Espace Patrimoine"
                                    subtitle="Saisissez votre email pour gérer et superviser vos investissements."
                                />
                            )}
                            
                            {activeTab === 'admin' && (
                                <AdminLoginForm 
                                    redirectPath="/admin"
                                    title="Authentification"
                                    subtitle="Console d'Administration Centrale (Certifiée)"
                                />
                            )}


                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bannière de réassurance en pied de page */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center flex flex-col items-center gap-2"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <ShieldCheck className={`w-4 h-4 ${currentTheme.badgeColor}`} />
                        <span>Protocole National de Sûreté 100% Certifié</span>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
