"use client"

import React from "react"
import { 
    ShieldCheck, 
    FileText, 
    CreditCard, 
    Users, 
    ClipboardCheck, 
    Scale, 
    Zap, 
    Globe,
    FileSignature,
    MessageSquare,
    AlertTriangle,
    ChevronRight,
    LucideIcon
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ModuleCardProps {
    id: string
    name: string
    description: string
    icon: LucideIcon
    status: "active" | "maintenance" | "beta"
    href: string
    delay: number
}

const ModuleCard = ({ id, name, description, icon: Icon, status, href, delay }: ModuleCardProps) => {
    const statusColors = {
        active: "bg-emerald-50 text-emerald-600 border-emerald-100",
        maintenance: "bg-amber-50 text-amber-600 border-amber-100",
        beta: "bg-purple-50 text-purple-600 border-purple-100"
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative overflow-hidden glass-panel p-6 rounded-[2.5rem] border border-white/20 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 bg-white/40 backdrop-blur-md"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-[1.5rem] ${statusColors[status]} transition-transform group-hover:scale-110 duration-500`}>
                    <Icon size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[status]}`}>
                    {status}
                </div>
            </div>

            <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{id}</span>
                    <h3 className="text-lg font-black text-gray-900 tracking-tighter uppercase">{name}</h3>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>

            <Link 
                href={href}
                className="flex items-center justify-between w-full p-4 bg-gray-900 text-white rounded-2xl group-hover:bg-primary transition-all active:scale-95 shadow-xl shadow-gray-900/10"
            >
                <span className="text-[10px] font-black uppercase tracking-widest">Gérer le Module</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Decorative mesh background element */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors"></div>
        </motion.div>
    )
}

const modules = [
    { 
        id: "M-CAND", 
        name: "Candidatures", 
        description: "Gestion des dossiers locataires et scoring ICL certifié.", 
        icon: Users, 
        status: "active", 
        href: "/admin/candidates" 
    },
    { 
        id: "M17-FISCAL", 
        name: "Fiscalité DGI", 
        description: "Certificats de quittance et droits d'enregistrement fiscaux.", 
        icon: ShieldCheck, 
        status: "active", 
        href: "/admin/fiscal" 
    },
    { 
        id: "M-EDL", 
        name: "États des Lieux", 
        description: "Moteur comparatif d'entrée/sortie et certification SHA-256.", 
        icon: ClipboardCheck, 
        status: "active", 
        href: "/admin/edl" 
    },
    { 
        id: "M-SIGN", 
        name: "Signatures", 
        description: "Preuves de signature électronique et horodatage légal.", 
        icon: FileSignature, 
        status: "active", 
        href: "/admin/signatures" 
    },
    { 
        id: "M-RCL", 
        name: "Réclamations", 
        description: "Gestion des tickets SAV et auto-clôture 144h réglementaire.", 
        icon: AlertTriangle, 
        status: "active", 
        href: "/admin/reclamations" 
    },
    { 
        id: "M-DIASPORA", 
        name: "Pack Diaspora", 
        description: "Services premium et supervision des mandats internationaux.", 
        icon: Globe, 
        status: "beta", 
        href: "/admin/diaspora" 
    },
    { 
        id: "M-PGW", 
        name: "Paiements PGW", 
        description: "Contrôle des flux Mobile Money et reversements bailleurs.", 
        icon: CreditCard, 
        status: "active", 
        href: "/admin/reversals" 
    },
    { 
        id: "M-DISPUTE", 
        name: "Médiation CACI", 
        description: "Arbitrage des litiges et dossiers de contentieux certifiés.", 
        icon: Scale, 
        status: "active", 
        href: "/admin/disputes" 
    }
]

export default function ModuleRegistryGrid() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl">
                        <Zap size={20} className="text-primary animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">Tour de Contrôle Applicative</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Supervision des modules coeur QAPRIL</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {modules.map((m, i) => (
                    <ModuleCard key={m.id} {...m as any} delay={i * 0.05} />
                ))}
            </div>
        </div>
    )
}
