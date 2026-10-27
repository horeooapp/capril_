"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Building2, ShieldAlert, Sparkles, ShieldCheck, Activity, Server, Fingerprint, Lock } from "lucide-react"
import Link from "next/link"
import EmailOTPForm from "./EmailOTPForm"
import AdminLoginForm from "./AdminLoginForm"

type ProfileTab = 'tenant' | 'landlord' | 'agency' | 'admin'

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
            color: "text-slate-900",
            textColor: "text-slate-600",
            activeBg: "bg-white text-slate-900 border-slate-300 shadow-sm",
            inactiveBg: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent",
            indicator: "bg-amber-600"
        },
        {
            id: 'landlord' as ProfileTab,
            label: "Propriétaire",
            icon: Building2,
            color: "text-slate-900",
            textColor: "text-slate-600",
            activeBg: "bg-white text-slate-900 border-slate-300 shadow-sm",
            inactiveBg: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent",
            indicator: "bg-amber-600"
        },
        {
            id: 'agency' as ProfileTab,
            label: "Agence & Démarcheur",
            icon: Building2,
            color: "text-slate-900",
            textColor: "text-slate-600",
            activeBg: "bg-white text-slate-900 border-slate-300 shadow-sm",
            inactiveBg: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent",
            indicator: "bg-sky-600"
        },
        {
            id: 'admin' as ProfileTab,
            label: "Administration",
            icon: ShieldAlert,
            color: "text-slate-900",
            textColor: "text-slate-600",
            activeBg: "bg-white text-slate-900 border-slate-300 shadow-sm",
            inactiveBg: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent",
            indicator: "bg-amber-600"
        }
    ]

    const backgroundThemes = {
        tenant: {
            tagText: "Espace Locataire Résidentiel",
            tagIconColor: "text-amber-600",
            badgeColor: "text-amber-600"
        },
        landlord: {
            tagText: "Gestion Patrimoniale Institutionnelle",
            tagIconColor: "text-amber-600",
            badgeColor: "text-amber-600"
        },
        agency: {
            tagText: "Console Professionnels : Agences Agréées & Démarcheurs",
            tagIconColor: "text-sky-600",
            badgeColor: "text-sky-600"
        },
        admin: {
            tagText: "Console d'Administration Centrale",
            tagIconColor: "text-amber-600",
            badgeColor: "text-amber-600"
        }
    }

    const currentTheme = backgroundThemes[activeTab]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
            {/* Trame architecturale filigrane */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none z-0" />

            <div className="container mx-auto z-10 flex flex-col items-center w-full max-w-5xl">
                
                {/* En-tête : Logo et Badge officiel */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link href="/" className="group inline-flex flex-col items-center">
                        <img 
                            src="/logo.png" 
                            alt="QAPRIL Logo" 
                            className="h-16 md:h-20 w-auto group-hover:scale-105 transition-transform duration-300" 
                        />
                    </Link>

                    <motion.div 
                        key={currentTheme.tagText}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-700 shadow-sm"
                    >
                        <Sparkles className={`w-3.5 h-3.5 ${currentTheme.tagIconColor}`} />
                        <span>{currentTheme.tagText}</span>
                    </motion.div>
                </div>

                {/* Sélecteur de profil (Pill Tabs épuré) */}
                <div className="w-full max-w-md mb-8 px-2">
                    <div className="flex items-center bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/70 shadow-inner relative">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2.5 px-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 relative border ${isActive ? tab.activeBg : tab.inactiveBg} ${tab.id === 'admin' ? 'hidden md:flex' : ''}`}
                                    aria-label={`Connexion profil ${tab.label}`}
                                >
                                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                                    <span className="tracking-tight">{tab.label}</span>
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
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="relative"
                        >
                            {activeTab === 'tenant' && (
                                <EmailOTPForm 
                                    role="TENANT"
                                    redirectPath="/mon-espace-locataire"
                                    title="Espace Locataire"
                                    subtitle="Saisissez votre email certifié pour accéder à votre habitat et vos quittances."
                                />
                            )}
                            
                            {activeTab === 'landlord' && (
                                <EmailOTPForm 
                                    role="LANDLORD"
                                    redirectPath="/dashboard"
                                    title="Espace Bailleur"
                                    subtitle="Saisissez votre email certifié pour superviser vos actifs et rendements."
                                />
                            )}
                            
                            {activeTab === 'agency' && (
                                <EmailOTPForm 
                                    role="AGENCY"
                                    redirectPath="/dashboard"
                                    title="Console Agences & Démarcheurs"
                                    subtitle="Saisissez votre email certifié pour accéder à votre espace de gestion et mandats."
                                />
                            )}
                            
                            {activeTab === 'admin' && (
                                <AdminLoginForm 
                                    redirectPath="/admin"
                                    title="Console d'Administration"
                                    subtitle="Accès réservé aux administrateurs de la plateforme"
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bannière de réassurance en pied de page */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 text-center flex flex-col items-center gap-2"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                        <ShieldCheck className={`w-4 h-4 ${currentTheme.badgeColor}`} />
                        <span>Plateforme Immobilière Institutionnelle Sécurisée</span>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
