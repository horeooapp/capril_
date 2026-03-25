"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Home, ShieldAlert, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
    const portals = [
        {
            title: "Locataire",
            description: "Gérez votre habitat, baux et quittances.",
            href: "/locataire/login",
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
            color: "from-[#1F4E79] to-[#0F172A]",
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
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,78,121,0.03)_0%,transparent_70%)]"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] via-[#1F4E79] to-[#C55A11]"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6 font-black text-[10px] uppercase tracking-widest text-gray-400">
                    <Sparkles className="w-3 h-3 text-[#C55A11]" />
                    Portail Officiel QAPRIL
                </div>
                <h1 className="text-5xl font-[1000] text-[#1F4E79] tracking-tighter uppercase leading-none mb-4">
                    Choisissez votre <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">interface.</span>
                </h1>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                    Connectez-vous à votre espace dédié pour une expérience certifiée et sécurisée.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
                {portals.map((portal, index) => (
                    <motion.div
                        key={portal.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link 
                            href={portal.href}
                            className="group block relative h-full bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>
                            
                            <div className="relative z-10">
                                <div className={`w-16 h-16 bg-gradient-to-br ${portal.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl ${portal.shadow} group-hover:-rotate-6 transition-transform duration-500`}>
                                    <portal.icon className="w-8 h-8" />
                                </div>
                                
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-gray-400`}>
                                    {portal.tag}
                                </span>
                                
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-[#1F4E79] transition-colors">
                                    {portal.title}
                                </h2>
                                
                                <p className="text-sm text-gray-500 leading-relaxed pr-6 mb-8 font-medium">
                                    {portal.description}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1F4E79]">
                                    Accéder <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                    Certifié par l'État de Côte d'Ivoire & QAPRIL v3.0
                </p>
            </motion.div>
        </div>
    )
}
