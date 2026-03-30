"use client"

import { useSession, SessionProvider } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
    User, 
    Home, 
    Building2, 
    Globe, 
    ShieldCheck, 
    ArrowRight,
    Loader2
} from "lucide-react"
import { useState } from "react"
import { setChosenRole } from "@/actions/role"

const ROLE_METADATA: Record<string, {
    title: string;
    description: string;
    icon: any;
    color: string;
    path: string;
}> = {
    'TENANT': {
        title: "Espace Locataire",
        description: "Gérez vos baux, payez vos loyers et suivez vos demandes de maintenance.",
        icon: User,
        color: "#1F4E79",
        path: "/locataire"
    },
    'LANDLORD': {
        title: "Propriétaire",
        description: "Supervisez votre patrimoine, suivez vos recouvrements et vos rapports financiers.",
        icon: Home,
        color: "#C55A11",
        path: "/dashboard"
    },
    'AGENCY': {
        title: "Agence / Mandataire",
        description: "Gestion multi-lots, mandats certifiés et tableaux de bord de performance.",
        icon: Building2,
        color: "#0F172A",
        path: "/dashboard"
    },
    'DIASPORA': {
        title: "QAPRIL Diaspora",
        description: "Suivi à distance de vos investissements en Côte d'Ivoire en toute sérénité.",
        icon: Globe,
        color: "#2563EB",
        path: "/dashboard"
    },
    'ADMIN': {
        title: "Console Administration",
        description: "Gestion système, validation KYC et supervision globale de la plateforme.",
        icon: ShieldCheck,
        color: "#DC2626",
        path: "/admin"
    }
}

function ChooseRoleContent() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [selecting, setSelecting] = useState<string | null>(null)

    if (!session?.user) return null;

    const eligibleRoles = (session.user as any).eligibleRoles || []

    async function handleSelectRole(role: string) {
        if (!session) return;
        setSelecting(role)
        const meta = ROLE_METADATA[role]
        
        // 1. Set the global lock in Redis via Server Action
        await setChosenRole(role)

        // 2. Update the session JWT with the chosen role
        await update({
            ...session,
            user: {
                ...session.user,
                chosenRole: role
            }
        })

        // 3. Redirect to the appropriate portal
        router.push(meta.path)
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#C55A11]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#1F4E79]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-4xl w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <img 
                        src="/logo.png" 
                        alt="QAPRIL" 
                        className="h-16 w-auto mx-auto mb-8 hover:scale-105 transition-transform" 
                    />
                    <h1 className="text-4xl font-black text-[#1F4E79] uppercase tracking-tight mb-4">
                        Bienvenue, {(session.user as any).fullName || session.user.email}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Votre compte possède plusieurs profils. Choisissez votre espace de travail pour cette session.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {eligibleRoles.map((role: string, index: number) => {
                        const meta = ROLE_METADATA[role] || ROLE_METADATA['TENANT'];
                        const Icon = meta.icon;

                        return (
                            <motion.button
                                key={role}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => handleSelectRole(role)}
                                disabled={!!selecting}
                                className="group relative bg-white rounded-[32px] p-8 text-left border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#C55A11]/30 transition-all duration-500"
                            >
                                <div className="flex items-start gap-6">
                                    <div 
                                        className="w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                        style={{ backgroundColor: `${meta.color}10`, color: meta.color }}
                                    >
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-[#1F4E79] group-hover:text-[#C55A11] transition-colors mb-2 uppercase tracking-wide">
                                            {meta.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            {meta.description}
                                        </p>
                                    </div>
                                    <div className="mt-1">
                                        {selecting === role ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-[#C55A11]" />
                                        ) : (
                                            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-[#C55A11] group-hover:translate-x-1 transition-all" />
                                        )}
                                    </div>
                                </div>

                                {/* Hover effect accent */}
                                <div 
                                    className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-[#C55A11] transition-all duration-700 rounded-b-[32px] w-full"
                                    style={{ background: `linear-gradient(to r, transparent, ${meta.color}, transparent)` }}
                                ></div>
                            </motion.button>
                        );
                    })}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 pt-8 border-t border-slate-200/60 flex flex-col items-center gap-4"
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Sécurité QAPRIL v3.0 • Accès Multi-Profils
                    </p>
                    <button 
                        onClick={() => window.location.href = '/api/auth/signout'}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                        Se déconnecter
                    </button>
                </motion.div>
            </div>
        </div>
    )
}

export default function ChooseRolePage() {
    return (
        <SessionProvider>
            <ChooseRoleContent />
        </SessionProvider>
    )
}
