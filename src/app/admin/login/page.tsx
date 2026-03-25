"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { ShieldAlert, Server, Fingerprint, Activity } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
            {/* Cybernetic Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)] opacity-20"></div>
            
            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1F4E79] opacity-20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#C55A11] opacity-10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 w-full max-w-lg px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex flex-col items-center mb-10">
                        <Link href="/" className="group inline-flex flex-col items-center mb-8">
                            <div className="relative w-20 h-20 bg-black rounded-3xl flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(31,78,121,0.3)] group-hover:border-[#C55A11]/50 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#1F4E79] to-transparent opacity-40"></div>
                                <ShieldAlert className="text-white w-10 h-10 relative z-10" />
                            </div>
                            <h1 className="mt-6 text-4xl font-black text-white tracking-[0.25em] uppercase leading-none">QAPRIL</h1>
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#C55A11]/10 rounded-full border border-[#C55A11]/30">
                                <Activity className="w-3 h-3 text-[#C55A11] animate-pulse" />
                                <span className="text-[9px] font-black text-[#C55A11] uppercase tracking-[0.2em]">Console Sécurisée v3.0</span>
                            </div>
                        </Link>
                    </div>

                    {/* Using the standard EmailOTPForm but with a specific style wrapper handled by parent classes if needed, 
                        but since EmailOTPForm is white-based inside, let's keep it as is or wrap it in a dark mode container if the text remains legible. 
                        Actually, EmailOTPForm uses white/40 backdrop. On dark background it will look like glass. */}
                    
                    <EmailOTPForm 
                        role="ADMIN"
                        redirectPath="/admin"
                        title="Authentification"
                        subtitle="Console d'Administration Centrale (Certifiée)"
                    />

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <Server className="w-4 h-4 text-gray-500 mb-2" />
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest text-center leading-tight">Serveur <br/> SRV-1472</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <Fingerprint className="w-4 h-4 text-gray-500 mb-2" />
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest text-center leading-tight">Bio-Auth <br/> Prête</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <Activity className="w-4 h-4 text-[#C55A11] mb-2" />
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest text-center leading-tight">Réseau <br/> Chiffré</span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Security Note */}
                <p className="mt-10 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] opacity-40">
                    Propriété de l'État de Côte d'Ivoire • Accès Restreint
                </p>
            </div>
        </div>
    )
}
