"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Home, ShieldAlert, ArrowRight, Sparkles } from "lucide-react"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function LoginPage() {
    const portals = [
        {
            title: "Locataire",
            description: "Gérez votre habitat, baux et quittances.",
            href: "/mon-espace-locataire/login",
            icon: Home,
            color: "from-[#10B981] to-[#059669]",
            shadow: "shadow-[#10B981]/20",
            tag: "Habitat"
        },
        {
            title: "Propriétaire",
            description: "Supervisez votre patrimoine immobilier.",
            href: "/dashboard/login",
            icon: Building2,
            color: "from-slate-800 to-[#0F172A]",
            shadow: "shadow-[#1F4E79]/20",
            tag: "Patrimoine"
        },
        {
            title: "Administration",
            description: "Accès certifié aux outils de régulation.",
            href: "/admin/login",
            icon: ShieldAlert,
            color: "from-[#C55A11] to-[#E87B2E]",
            shadow: "shadow-[#C55A11]/20",
            tag: "Équipe"
        }
    ]

    return (
        <>
            {/* Version Web PC - Intacte */}
            <div className="hidden md:flex min-h-screen bg-[#0B1120] flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Premium Background Elements */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[150px] rounded-full animate-pulse opacity-50 mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-600/20 blur-[150px] rounded-full animate-pulse animation-delay-2000 opacity-50 mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse animation-delay-4000 opacity-50 mix-blend-screen pointer-events-none"></div>
                
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 mb-6 font-black text-[10px] uppercase tracking-widest text-gray-300">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Portail Officiel QAPRIL
                    </div>
                    <h1 className="text-5xl md:text-6xl font-[1000] text-white tracking-tighter uppercase leading-none mb-4">
                        Choisissez votre <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-600">interface.</span>
                    </h1>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto text-sm">
                        Connectez-vous à votre espace dédié pour une expérience certifiée et sécurisée.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
                    {portals.map((portal, index) => (
                        <motion.div
                            key={portal.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                        >
                            <Link 
                                href={portal.href}
                                className="group block relative h-full bg-[#1e293b]/40 backdrop-blur-3xl rounded-[32px] p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Hover Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`}></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${portal.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl ${portal.shadow} group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-500`}>
                                        <portal.icon className="w-8 h-8" />
                                    </div>
                                    
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-gray-500 group-hover:text-gray-400 transition-colors`}>
                                        {portal.tag}
                                    </span>
                                    
                                    <h2 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-500 transition-all">
                                        {portal.title}
                                    </h2>
                                    
                                    <p className="text-sm text-gray-400 leading-relaxed pr-6 mb-8 font-medium group-hover:text-gray-300 transition-colors">
                                        {portal.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                        Accéder <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 text-center relative z-10"
                >
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">
                        QAPRIL v3.0
                    </p>
                    <div className="inline-flex h-1 w-12 bg-white/10 rounded-full"></div>
                </motion.div>
            </div>

            {/* Version Web Mobile Exlusive - Nouveau design unifié */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="tenant" />
            </div>
        </>
    )
}
