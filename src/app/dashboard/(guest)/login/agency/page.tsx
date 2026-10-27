"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { Building2, Sparkles, ArrowLeft, ShieldCheck, ClipboardList, Users2 } from "lucide-react"
import { motion } from "framer-motion"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function AgencyLoginPage() {
    return (
        <>
            {/* Version Web Desktop — Split 50/50 Architectural Exécutif Professionnel */}
            <div className="hidden md:flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans tracking-tight">
                
                {/* Visual Left Side — Tour d'affaires et cadre d'exercice agréé */}
                <div className="relative w-1/2 min-h-screen hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-slate-200 bg-slate-900">
                    {/* Background Cityscape Image */}
                    <img
                        src="/images/abidjan_plateau_bg.png"
                        alt="Plateau Abidjan Centre d'Affaires"
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 scale-105 transition-transform duration-1000"
                    />
                    
                    {/* Overlay architectural élégant bleu marine & ardoise */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-sky-950/40" />

                    {/* Top Branding */}
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3.5 group">
                            <img 
                                src="/logo.png" 
                                alt="QAPRIL Logo" 
                                className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 brightness-0 invert" 
                            />
                            <div className="h-5 w-px bg-white/20" />
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                                    Console Agences & Démarcheurs
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Bottom Content Over Image */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative z-10 max-w-xl text-white"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-black uppercase tracking-wider text-sky-300 mb-6 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            Mandats Exclusifs & Gestion Déléguée
                        </div>

                        <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-4 uppercase text-white">
                            Pilotez vos Mandats <br />
                            <span className="text-sky-400">& Portefeuille Biens.</span>
                        </h1>

                        <p className="text-sm xl:text-base text-slate-300 font-medium leading-relaxed mb-8 max-w-lg">
                            Plateforme dédiée aux agences immobilières agréées, gestionnaires de parcs et démarcheurs indépendants certifiés en Côte d'Ivoire.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-3.5 rounded-xl border border-slate-700/80 inline-flex shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="w-7 h-7 text-sky-400" />
                                <div>
                                    <div className="text-xl xl:text-2xl font-black text-white">Mandats</div>
                                    <div className="text-[9px] uppercase tracking-wider text-sky-400 font-bold">100% Juridiques</div>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/15" />
                            <div className="flex items-center gap-3">
                                <Users2 className="w-7 h-7 text-sky-400" />
                                <div>
                                    <div className="text-xl xl:text-2xl font-black text-white">Commissions</div>
                                    <div className="text-[9px] uppercase tracking-wider text-sky-400 font-bold">Reversement Instantané</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Form Right Side — Blanc épuré lumineux */}
                <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 lg:p-12 relative z-20 bg-[#F8FAFC]">
                    {/* Grille fine vectorielle */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-md relative z-10"
                    >
                        {/* Mobile/Tablet logo */}
                        <div className="flex flex-col items-center mb-8 lg:hidden">
                            <Link href="/">
                                <img 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-12 w-auto mb-3" 
                                />
                            </Link>
                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider">Console Agences & Démarcheurs</span>
                        </div>

                        {/* Back Link */}
                        <div className="mb-6">
                            <Link 
                                href="/login" 
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                                <span>Changer d'espace d'accès</span>
                            </Link>
                        </div>

                        {/* Form Card */}
                        <div className="relative">
                            <EmailOTPForm 
                                role="AGENCY"
                                redirectPath="/dashboard"
                                title="Espace Agences & Démarcheurs"
                                subtitle="Saisissez votre email certifié pour accéder à votre console professionnelle."
                            />
                        </div>

                        {/* Footer Links */}
                        <div className="mt-8 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                            <Link href="/contact" className="hover:text-slate-900 transition-colors">Assistance Partenaires</Link>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <Link href="/cgu" className="hover:text-slate-900 transition-colors">Cadre Réglementaire</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Version Web Mobile — Tab unifié avec tab Agence */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="agency" />
            </div>
        </>
    )
}
