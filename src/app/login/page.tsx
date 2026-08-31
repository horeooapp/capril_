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
            color: "text-white",
            tag: "Habitat"
        },
        {
            title: "Propriétaire",
            description: "Supervisez votre patrimoine immobilier.",
            href: "/dashboard/login",
            icon: Building2,
            color: "text-white",
            tag: "Patrimoine"
        },
        {
            title: "Administration",
            description: "Accès certifié aux outils de régulation.",
            href: "/admin/login",
            icon: ShieldAlert,
            color: "text-white",
            tag: "Équipe"
        }
    ]

    return (
        <>
            {/* Version Web PC - Intacte */}
            <div className="hidden md:flex min-h-screen bg-[#09090B] flex-col items-center justify-center p-6 relative overflow-hidden font-sans tracking-tight">
                {/* Premium Clean Background */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6 font-semibold text-[10px] uppercase tracking-widest text-slate-400">
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
                                className="group block relative h-full bg-[#18181B] rounded-[24px] p-8 border border-white/5 hover:border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-500`}>
                                        <portal.icon className="w-6 h-6" />
                                    </div>
                                    
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block text-slate-500 transition-colors`}>
                                        {portal.tag}
                                    </span>
                                    
                                    <h2 className="text-2xl font-bold text-white tracking-tight mb-4 transition-all">
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
