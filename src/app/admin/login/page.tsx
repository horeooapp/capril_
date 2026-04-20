"use client"

import Link from "next/link"
import AdminLoginForm from "@/components/auth/AdminLoginForm"
import { ShieldAlert, Server, Fingerprint, Activity } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
            {/* Cybernetic Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)] pointer-events-none z-0"></div>
            
            {/* Glowing Orbs with Animations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[150px] rounded-full animate-pulse opacity-50 mix-blend-screen pointer-events-none z-0"></div>
            <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full animate-pulse animation-delay-2000 opacity-50 mix-blend-screen pointer-events-none z-0"></div>

            <div className="relative z-10 w-full max-w-lg px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-[#0B1120]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute -inset-6 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent pointer-events-none -z-10"></div>

                    <div className="flex flex-col items-center mb-10">
                        <Link href="/" className="group inline-flex flex-col items-center mb-8">
                            <img 
                                src="/logo.png" 
                                alt="QAPRIL Logo" 
                                className="w-40 h-auto group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] brightness-0 invert" 
                            />
                            <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Console Sécurisée v3.0</span>
                            </div>
                        </Link>
                    </div>
                    
                    <AdminLoginForm 
                        redirectPath="/admin"
                        title="Authentification"
                        subtitle="Console d'Administration Centrale (Certifiée)"
                    />

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-inner group transition-all hover:bg-white/10">
                            <Server className="w-4 h-4 text-gray-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Serveur <br/> SRV-1472</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-inner group transition-all hover:bg-white/10">
                            <Fingerprint className="w-4 h-4 text-gray-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Bio-Auth <br/> Prête</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-inner group transition-all hover:bg-white/10">
                            <Activity className="w-4 h-4 text-amber-500 mb-2 group-hover:text-amber-400 transition-colors" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Réseau <br/> Chiffré</span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Security Note */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]"
                >
                    Propriété de l'État de Côte d'Ivoire &nbsp;|&nbsp; Accès Restreint
                </motion.p>
            </div>
        </div>
    )
}
