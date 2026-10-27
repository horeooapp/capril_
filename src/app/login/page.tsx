"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Home, ShieldAlert, ArrowRight, Sparkles } from "lucide-react"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function LoginPage() {
    const portals = [
        {
            title: "Locataire",
            description: "Gérez votre habitat, réglez vos loyers et téléchargez vos quittances certifiées.",
            href: "/mon-espace-locataire/login",
            icon: Home,
            color: "text-white",
            tag: "Habitat",
            image: "/images/hero_ivory_coast_home_interior_1773609718319.png"
        },
        {
            title: "Propriétaire",
            description: "Supervisez votre patrimoine immobilier, vos baux et encaissez vos loyers.",
            href: "/dashboard/login",
            icon: Building2,
            color: "text-white",
            tag: "Patrimoine",
            image: "/images/login_landlord_visual.jpg"
        },
        {
            title: "Agences & Démarcheurs",
            description: "Gérez vos mandats de gestion déléguée, prospection, parcs et commissions.",
            href: "/dashboard/login/agency",
            icon: Building2,
            color: "text-white",
            tag: "Professionnels",
            image: "/images/abidjan_plateau_bg.png"
        }
    ]

    return (
        <>
            {/* Version Web Desktop — Design Exécutif Lumineux Architectural */}
            <div className="hidden md:flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F8FAFC] font-sans tracking-tight">
                {/* Grille fine vectorielle d'architecture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
                
                {/* Lueur ambrée très subtile et nette */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 relative z-10"
                >
                    <Link href="/" className="inline-block mb-6 group">
                        <img 
                            src="/logo.png" 
                            alt="QAPRIL Logo" 
                            className="h-12 w-auto mx-auto group-hover:scale-105 transition-transform" 
                        />
                    </Link>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-slate-200 mb-4 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                            Portail Officiel QAPRIL · Infrastructure Souveraine
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-3">
                        Sélectionnez votre <br />
                        <span className="text-[#D97706]">Espace d'Accès.</span>
                    </h1>
                    <p className="text-slate-600 font-medium max-w-md mx-auto text-sm leading-relaxed">
                        Authentification certifiée et scellée pour propriétaires, locataires et administrateurs institutionnels.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
                    {portals.map((portal, index) => (
                        <motion.div
                            key={portal.title}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                        >
                            <Link 
                                href={portal.href}
                                className="group block relative h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 overflow-hidden shadow-sm"
                            >
                                {/* Card image avec bandeau soigné */}
                                <div className="relative h-44 overflow-hidden border-b border-slate-100 bg-slate-100">
                                    <img
                                        src={portal.image || "/slider/bg_slider_2.png"}
                                        alt={portal.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-wider text-slate-800">
                                        {portal.tag}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center mb-4 group-hover:bg-[#D97706] group-hover:text-white transition-colors duration-300">
                                        <portal.icon className="w-5 h-5" />
                                    </div>
                                    
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-[#D97706] transition-colors">
                                        {portal.title}
                                    </h2>
                                    
                                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
                                        {portal.description}
                                    </p>
                                    
                                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#D97706] group-hover:text-[#B45309] transition-colors">
                                        <span>Connexion à l'espace</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-14 text-center relative z-10 flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    <Link href="/" className="hover:text-slate-900 transition-colors">← Retour au site public</Link>
                    <span>·</span>
                    <span>Conformité Loi 2019-576 & OHADA</span>
                    <span>·</span>
                    <Link href="/contact" className="hover:text-slate-900 transition-colors">Assistance</Link>
                </motion.div>
            </div>

            {/* Version Web Mobile — Cohérente et épurée */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="tenant" />
            </div>
        </>
    )
}
