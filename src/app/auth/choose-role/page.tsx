"use client"

import { useSession, SessionProvider } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
    User, 
    Home, 
    Building2, 
    Globe, 
    Handshake,
    ShieldCheck, 
    ArrowRight,
    Loader2,
    Sparkles,
    Briefcase
} from "lucide-react"
import { useState, useEffect } from "react"
import { setChosenRole } from "@/actions/role"

const ROLE_METADATA: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
    glow: string;
    path: string;
}> = {
    'TENANT': {
        title: "Locataire",
        subtitle: "ESPACE PERSONNEL",
        description: "Gérez vos baux, payez vos loyers et suivez vos demandes de maintenance.",
        icon: User,
        color: "#1F4E79",
        glow: "rgba(31, 78, 121, 0.15)",
        path: "/mon-espace-locataire"
    },
    'LANDLORD': {
        title: "Propriétaire",
        subtitle: "GESTION PATRIMOINE",
        description: "Supervisez votre parc, suivez vos recouvrements et vos rapports financiers.",
        icon: Home,
        color: "#C55A11",
        glow: "rgba(197, 90, 17, 0.15)",
        path: "/dashboard"
    },
    'AGENCY': {
        title: "Agence Immobilière",
        subtitle: "TOOLS EXPERTS",
        description: "Gestion multi-lots, mandats certifiés et tableaux de bord de performance.",
        icon: Building2,
        color: "#0F172A",
        glow: "rgba(15, 23, 42, 0.15)",
        path: "/dashboard"
    },
    'AGENCE_AGREE': {
        title: "Agence Agréée",
        subtitle: "EXPERTISE CERTIFIÉE",
        description: "Accès complet aux outils métiers pour agences avec agrément d'état.",
        icon: ShieldCheck,
        color: "#0D2B6E",
        glow: "rgba(13, 43, 110, 0.15)",
        path: "/dashboard"
    },
    'AGENCE_NON_AGREE': {
        title: "Gestionnaire",
        subtitle: "GESTION IMMOBILIÈRE",
        description: "Outils de gestion locative pour structures non agréées ou syndics.",
        icon: Briefcase,
        color: "#4A5B7A",
        glow: "rgba(74, 91, 122, 0.15)",
        path: "/dashboard"
    },
    'NON_CERTIFIED_AGENT': {
        title: "Gestionnaire Privé",
        subtitle: "GESTION INDÉPENDANTE",
        description: "Gérez plusieurs biens et locataires avec nos outils de gestion avancée.",
        icon: Briefcase,
        color: "#4F46E5",
        glow: "rgba(79, 70, 229, 0.15)",
        path: "/dashboard"
    },
    'INTERMEDIARY': {
        title: "Intermédiaire",
        subtitle: "SUIVI DÉLÉGUÉ",
        description: "Accès délégué pour la supervision et le suivi des dossiers de location.",
        icon: Handshake,
        color: "#0891B2",
        glow: "rgba(8, 145, 178, 0.15)",
        path: "/dashboard"
    },
    'DIASPORA': {
        title: "QAPRIL Diaspora",
        subtitle: "INVESTISSEUR IVOIRIEN",
        description: "Suivi à distance de vos investissements en Côte d'Ivoire en toute sérénité.",
        icon: Globe,
        color: "#059669",
        glow: "rgba(5, 150, 105, 0.15)",
        path: "/dashboard"
    },
    'ADMIN': {
        title: "Administrateur",
        subtitle: "SUPERVISION SYSTÈME",
        description: "Gestion système, validation KYC et supervision globale de la plateforme.",
        icon: ShieldCheck,
        color: "#DC2626",
        glow: "rgba(220, 38, 38, 0.15)",
        path: "/admin"
    }
}

function ChooseRoleContent() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [selecting, setSelecting] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!session?.user || !mounted) return null;

    const eligibleRoles = (session.user as any).eligibleRoles || [session.user.role]

    async function handleSelectRole(role: string) {
        if (!session) return;
        setSelecting(role)
        const meta = ROLE_METADATA[role] || ROLE_METADATA['TENANT']
        
        try {
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
        } catch (error) {
            console.error("Select role error:", error)
            setSelecting(null)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Immersive Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#C55A11]/5 rounded-full blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        x: [0, -100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-[#1F4E79]/5 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="max-w-5xl w-full relative z-10">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-center mb-16 relative"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8 overflow-hidden group">
                        <Sparkles size={14} className="text-[#C55A11] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expérience QAPRIL V4</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    
                    <img 
                        src="/logo.png" 
                        alt="QAPRIL" 
                        className="h-14 w-auto mx-auto mb-8 drop-shadow-sm" 
                    />
                    
                    <h1 className="text-4xl md:text-5xl font-black text-[#1F4E79] uppercase tracking-tighter mb-4 leading-none">
                        Ravi de vous revoir,<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1F4E79] to-[#C55A11]">
                            {(session.user as any).firstName || (session.user as any).fullName || session.user.email?.split('@')[0]}
                        </span>
                    </h1>
                    <p className="max-w-lg mx-auto text-slate-500 font-medium text-lg leading-relaxed">
                        Choisissez le profil d'accès pour votre session de travail actuelle. 
                        Vous pourrez basculer à tout moment.
                    </p>
                </motion.div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    <AnimatePresence mode="popLayout">
                        {eligibleRoles.map((role: string, index: number) => {
                            const meta = ROLE_METADATA[role] || { ...ROLE_METADATA['TENANT'], title: role };
                            const Icon = meta.icon;

                            return (
                                <motion.button
                                    key={role}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index, duration: 0.5 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectRole(role)}
                                    disabled={!!selecting}
                                    className="group relative bg-white rounded-[2.5rem] p-8 text-left border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-transparent transition-all duration-500 flex flex-col h-full overflow-hidden"
                                >
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-500"></div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white via-white/80 to-transparent"></div>
                                    
                                    {/* Icon Container with Glow */}
                                    <div className="relative z-10 mb-8">
                                        <div 
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110 shadow-inner overflow-hidden"
                                            style={{ backgroundColor: `${meta.color}10`, color: meta.color }}
                                        >
                                            <Icon className="w-8 h-8 relative z-10" />
                                            {/* Pulsing Glow behind icon */}
                                            <div 
                                                className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                                                style={{ backgroundColor: meta.glow }}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex-1 flex flex-col">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: meta.color }}>
                                            {meta.subtitle}
                                        </p>
                                        <h3 className="text-2xl font-black text-[#1F4E79] mb-4 uppercase tracking-tight group-hover:text-qnavy-dark transition-colors">
                                            {meta.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium group-hover:text-slate-600 transition-colors">
                                            {meta.description}
                                        </p>
                                    </div>

                                    {/* Footer Interaction */}
                                    <div className="relative z-10 mt-8 pt-6 border-t border-slate-50 flex items-center justify-between overflow-hidden">
                                        {selecting === role ? (
                                            <div className="flex items-center gap-2 text-[#C55A11]">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Connexion...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]/30 group-hover:text-[#1F4E79] transition-colors">
                                                    Accéder au portail
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1F4E79] group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Interactive corner glow */}
                                    <div 
                                        className="absolute -bottom-10 -right-10 w-32 h-32 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                                        style={{ backgroundColor: meta.color }}
                                    ></div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Footer Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 pt-10 border-t border-slate-200/40 flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-8">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden flex items-center justify-center text-[10px] font-black text-slate-400">
                                     {i}
                                 </div>
                             ))}
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-xs text-center border-l border-slate-200 pl-8">
                            Portail de Gestion Immobilier Certifié pour la Côte d'Ivoire
                        </p>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/api/auth/signout'}
                        className="group flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
                    >
                        Quitter la session certifiée
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </motion.div>
            </div>
            
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap');
                body {
                    font-family: 'Outfit', sans-serif;
                }
            `}</style>
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
