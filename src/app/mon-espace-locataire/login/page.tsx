"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { Home, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function TenantLoginPage() {
    return (
        <>
            {/* Version Web Desktop — Split 50/50 Architectural Exécutif Lumineux */}
            <div className="hidden md:flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans tracking-tight">
                
                {/* Visual Left Side — Résidence moderne et cadre souverain */}
                <div className="relative w-1/2 min-h-screen hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-slate-200 bg-slate-900">
                    {/* Background Interior Image */}
                    <img
                        src="/images/hero_ivory_coast_home_interior_1773609718319.png"
                        alt="Intérieur résidentiel moderne Abidjan"
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000"
                    />
                    
                    {/* Overlay architectural élégant */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />

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
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                                    Portail Résident & Locataire
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
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-wider text-amber-300 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Passeport Locataire & Caution CDC-CI
                        </div>

                        <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-4 uppercase text-white">
                            Habitez en <br />
                            <span className="text-amber-400">Toute Sérénité.</span>
                        </h1>

                        <p className="text-sm xl:text-base text-slate-300 font-medium leading-relaxed mb-8 max-w-lg">
                            Paiement simplifié par Wave, Orange Money et MoMo, reçus et quittances numériques infalsifiables, et consignation protégée de votre dépôt de garantie.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-3.5 rounded-xl border border-slate-700/80 inline-flex shadow-xl">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-7 h-7 text-[#D97706]" />
                                <div>
                                    <div className="text-xl xl:text-2xl font-black text-white">100% Légal</div>
                                    <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Loi 2019-576</div>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/15" />
                            <div>
                                <div className="text-xl xl:text-2xl font-black text-white">0 Litige</div>
                                <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Preuves Scellées</div>
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
                            <span className="text-[10px] font-black text-[#D97706] uppercase tracking-wider">Espace Locataire</span>
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
                                role="TENANT"
                                redirectPath="/mon-espace-locataire"
                                title="Espace Locataire"
                                subtitle="Saisissez votre email pour accéder à votre espace de vie et vos quittances."
                            />
                        </div>

                        {/* Footer Links */}
                        <div className="mt-8 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                            <Link href="/contact" className="hover:text-slate-900 transition-colors">Assistance & Support</Link>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <Link href="/cgu" className="hover:text-slate-900 transition-colors">Cadre Juridique</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Version Web Mobile — Tab unifié */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="tenant" />
            </div>
        </>
    )
}
