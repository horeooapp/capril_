"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { ShieldCheck, TrendingUp, Gem } from "lucide-react"
import { motion } from "framer-motion"

export default function LandlordLoginPage() {
    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Elegant Background Mesh */}
            <div className="absolute inset-0 bg-[#0F172A] opacity-[0.02]"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C55A11] opacity-[0.05] rounded-full blur-[100px]"></div>
            
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Link href="/" className="flex flex-col items-start mb-16 group">
                            <img 
                                src="/logo.png" 
                                alt="QAPRIL Logo" 
                                className="h-20 w-auto group-hover:scale-105 transition-transform duration-500" 
                            />
                            <p className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.3em] mt-4 ml-1">Console Propriétaire</p>
                        </Link>

                        <EmailOTPForm 
                            role="LANDLORD"
                            redirectPath="/dashboard"
                            title="Gestion de Patrimoine"
                            subtitle="Entrez votre email pour accéder à votre console de supervision immobilière."
                        />

                        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <Link href="/auth/forgot-password" title="Accès de secours" className="hover:text-[#C55A11] transition-colors">Supervision</Link>
                            <span className="opacity-30">|</span>
                            <Link href="/contact" className="hover:text-[#C55A11] transition-colors">Support Dédié</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Exclusive Visual Side Panel */}
            <div className="hidden lg:block relative w-0 flex-1 bg-[#0F172A] overflow-hidden">
                <div className="absolute inset-0 bg-[url('/ivory-pattern.svg')] opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1F4E79] to-[#C55A11]/20"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-white">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="max-w-2xl"
                    >
                        <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-[18px] border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase text-[#C55A11]">
                            <ShieldCheck className="w-5 h-5" />
                            Accès Distingué & Sécurisé
                        </div>
                        <h2 className="text-7xl font-black tracking-tighter leading-[0.85] mb-10 uppercase">
                            Supervisez <br />
                            votre <span className="italic font-serif normal-case text-[#C55A11] text-8xl">patrimoine.</span>
                        </h2>
                        
                        <div className="h-1 w-24 bg-gradient-to-r from-[#C55A11] to-transparent mb-12"></div>

                        <p className="text-2xl text-slate-300 font-light leading-relaxed mb-16">
                            Accédez en temps réel à vos rapports financiers, vos baux certifiés et la gestion simplifiée de vos locataires sur l'infrastructure d'État.
                        </p>
                        
                        <div className="flex gap-12">
                            <div>
                                <div className="text-4xl font-black text-white mb-2 font-serif">A+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C55A11] font-black opacity-80">Notation Sûreté</div>
                            </div>
                            <div className="w-px h-12 bg-white/10 mt-2"></div>
                            <div>
                                <div className="text-4xl font-black text-white mb-2 font-serif">100%</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C55A11] font-black opacity-80">Conformité DGI</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Abstract Decorative Light */}
                <div className="absolute top-1/2 -right-64 w-96 h-96 bg-[#C55A11]/20 blur-[150px] rounded-full"></div>
            </div>
        </div>
    )
}
