"use client"
import { toast } from "sonner";

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { 
    ShieldCheck, 
    Calendar, 
    Receipt, 
    AlertCircle, 
    TrendingUp, 
    Key, 
    Lock, 
    ChevronRight,
    Search,
    Download,
    CreditCard,
    Headset,
    MapPin,
    ArrowUpRight,
    Zap,
    CheckCircle,
    XCircle,
    Info,
    BookOpen,
    Users,
    Building2,
    Clock,
    Sparkles
} from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import { confirmBDQFromDashboard } from "@/actions/lease.actions"

// Badge component defined outside to avoid ReferenceError in early returns
const Badge = ({ label, color, bg, size = 10 }: any) => (
    <span 
        style={{ backgroundColor: bg, color: color, fontSize: `${size}px` }} 
        className="px-3 py-1 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1.5"
    >
        {label}
    </span>
)

export default function LocataireDashboardPage() {
    const { data: session, status } = useSession()
    const [isPending, startTransition] = useTransition()
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/mon-espace-locataire/login")
            return
        }

        async function loadData() {
            try {
                const data = await getTenantDashboard()
                if (data) {
                    setDashboardData(data)
                } else {
                    setDashboardData({ success: false, error: "Erreur de communication avec le serveur." })
                }
            } catch (err: any) {
                console.error("Dashboard Load Error:", err)
                setDashboardData({ success: false, error: err.message || "Une erreur inattendue est survenue." })
            } finally {
                setLoading(false)
            }
        }

        if (status === "authenticated") {
            loadData()
        }
    }, [status])

    if (status === "loading" || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Synchronisation de votre espace...</p>
            </div>
        )
    }

    if (!dashboardData?.success) {
        return (
            <div className="flex items-center justify-center p-8 text-center text-rose-700 bg-rose-50/80 border border-rose-200 rounded-3xl max-w-lg mx-auto mt-12 overflow-hidden shadow-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <AlertCircle className="mx-auto mb-4 text-rose-600" size={32} />
                    <p className="font-bold text-base">Erreur de chargement</p>
                    <p className="text-xs text-rose-600/80 mt-2">{dashboardData?.error || "Incapable de joindre le serveur d'authentification."}</p>
                </motion.div>
            </div>
        )
    }

    if (!dashboardData.hasLease) {
        const pending = dashboardData.pendingDeclarations || [];

        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden py-16">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-3xl"
                >
                    {pending.length > 0 ? (
                        <div className="space-y-8">
                             <div className="space-y-3">
                                <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-2xl shadow-sm mx-auto mb-4">
                                    🔔
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    Déclaration de Bail Reçue
                                </h1>
                                <p className="text-sm text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                                    Votre bailleur ou gérant a déclaré votre logement. Validez pour activer votre bail numérique certifié et débloquer votre <strong>Passeport Confiance</strong>.
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                {pending.map((bdq: any) => (
                                    <div key={bdq.id} className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] relative overflow-hidden group">
                                        <div className="relative z-10 space-y-5">
                                            <div className="flex justify-between items-start">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
                                                    Bail Déclaratif
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400">#{bdq.id.substring(0,8).toUpperCase()}</span>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-black text-slate-900 tracking-tight mb-1">
                                                    {bdq.property?.name || bdq.descriptionLogement.split(',')[0]}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <MapPin size={12} />
                                                    <span className="text-xs font-semibold">{bdq.property?.commune || "Adresse déclarée"}</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[11px] font-semibold text-slate-400">Loyer mensuel</span>
                                                    <span className="text-sm font-black text-slate-900 font-mono">{bdq.loyerDeclareMensuel.toLocaleString()} XOF</span>
                                                </div>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[11px] font-semibold text-slate-400">Bailleur</span>
                                                    <span className="text-xs font-bold text-slate-700">{bdq.bailleur?.firstName} {bdq.bailleur?.lastName}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                                <button 
                                                    disabled={isPending}
                                                    onClick={async () => {
                                                        startTransition(async () => {
                                                            const res = await confirmBDQFromDashboard(bdq.id, "OUI");
                                                            if (res.success) {
                                                                toast.success("Bail confirmé avec succès !");
                                                                window.location.reload();
                                                            } else {
                                                                toast.error(res.error || "Erreur lors de la confirmation.");
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    <CheckCircle size={15} /> Confirmer
                                                </button>
                                                <button 
                                                    disabled={isPending}
                                                    onClick={async () => {
                                                        const motif = prompt("Veuillez indiquer le motif de contestation :");
                                                        if (!motif) return;
                                                        startTransition(async () => {
                                                            const res = await confirmBDQFromDashboard(bdq.id, "NON", motif);
                                                            if (res.success) {
                                                                toast.info("Déclaration contestée. Un médiateur prendra contact.");
                                                                window.location.reload();
                                                            } else {
                                                                toast.error(res.error || "Erreur.");
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold py-3 px-4 rounded-xl text-xs transition-all disabled:opacity-50"
                                                >
                                                    <XCircle size={15} /> Contester
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-6 mx-auto">
                                🏠
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                Bienvenue sur votre Espace Locataire
                            </h1>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                                Aucun bail actif n'est encore lié à votre numéro ({dashboardData.user?.phone || 'Profil non renseigné'}). 
                                Demandez à votre bailleur de vous déclarer ou complétez votre profil.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link 
                                    href="/onboarding/tenant" 
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 text-xs"
                                >
                                    Compléter mon profil
                                </Link>
                                <button 
                                    onClick={() => router.push('/contact')} 
                                    className="bg-white border border-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-all text-xs"
                                >
                                    Centre d'aide & FAQ
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        )
    }

    const lease = dashboardData.lease
    const utilities = dashboardData.utilities || []
    
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    }

    // Bento Grid Item Wrapper
    const BentoItem = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
        <motion.div 
            variants={itemVariants}
            className={`rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 relative bg-white overflow-hidden group ${className}`}
        >
            {children}
        </motion.div>
    )

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto px-4 py-8 space-y-8"
        >
            {/* 1. Header & Quick Status */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)]">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Espace Locataire Certifié · Bail Protégé
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Bonjour, <span className="text-emerald-700">{dashboardData.user?.firstName || 'Locataire'}</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Suivez votre loyer, vos quittances officielles et votre score de confiance ICL.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernière Quittance</p>
                        <p className="text-xs font-black text-slate-900 font-mono">
                            {lease.lastReceiptDate 
                                ? new Date(lease.lastReceiptDate).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: 'numeric' })
                                : "En attente"}
                        </p>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                        <NotificationCenter variant="tenant" />
                    </div>
                </div>
            </header>

            {/* 2. The Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
                
                {/* PRIMARY HERO: Rent & Payment (8 cols) */}
                <BentoItem className="md:col-span-8 p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#0F172A] via-[#0B1222] to-[#020617] text-white border-none shadow-[0_20px_50px_rgba(15,23,42,0.25)] min-h-[260px]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10 text-white/90">
                                Loyer en cours
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <ShieldCheck size={13} /> DGI Enregistré
                            </span>
                        </div>
                        
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono">
                                {lease.rentAmount.toLocaleString()}
                            </span>
                            <span className="text-base sm:text-xl font-bold text-amber-400 font-mono">
                                XOF
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-xs text-slate-300 font-medium">
                            <Clock size={13} className="text-amber-400" />
                            <span>Date limite :</span>
                            <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
                                {new Date(lease.rentDeadline).toLocaleDateString('fr-CI', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                        <Link 
                            href="/mon-espace-locataire/payment" 
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl px-6 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            <span>Régler maintenant</span>
                            <ArrowUpRight size={16} />
                        </Link>
                        <button 
                            className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center gap-2 border border-white/15 transition-all text-xs font-bold"
                            onClick={(e) => { e.preventDefault(); router.push('/mon-espace-locataire/receipts') }}
                            title="Voir mes quittances"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Quittances</span>
                        </button>
                    </div>
                </BentoItem>

                {/* ICL SCORE CARD (4 cols) */}
                <BentoItem className="md:col-span-4 p-7 flex flex-col justify-between bg-white group" delay={0.1}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black uppercase tracking-wider">
                                <Sparkles size={12} /> Passeport Actif
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Palier Or</span>
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Score de Confiance ICL
                        </p>
                        
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
                                {dashboardData.score}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 1000</span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(Math.round((dashboardData.score / 1000) * 100), 100)}%` }}
                            />
                        </div>

                        <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
                            Profil exemplaire. Vous bénéficiez d'une <strong className="text-emerald-700">priorité de relocation</strong> et d'un allègement de caution.
                        </p>
                    </div>
                    
                    <Link 
                        href="/mon-espace-locataire/passeport" 
                        className="mt-6 w-full text-center py-3 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                    >
                        <span>Mon Passeport Confiance</span>
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                {/* PROPERTY CARD (5 cols) */}
                <BentoItem className="md:col-span-5 p-7 flex flex-col justify-between" delay={0.2}>
                   <div>
                        <div className="flex items-center gap-3.5 mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700 font-bold shrink-0">
                                <Building2 size={20} />
                             </div>
                             <div className="min-w-0">
                                 <h3 className="text-base font-black text-slate-900 tracking-tight truncate">
                                     {lease.property?.name || "Résidence Zen"}
                                 </h3>
                                 <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-0.5">
                                     <MapPin size={12} className="shrink-0" />
                                     <span className="truncate">
                                         {lease.property?.commune || "Quartier"}, {lease.property?.city || "Abidjan"}
                                     </span>
                                 </div>
                             </div>
                        </div>

                        <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-400">Bail Certifié</span>
                                <span className="font-mono font-bold text-slate-800">#{lease.leaseReference}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-400">Date d'entrée</span>
                                <span className="font-bold text-slate-800">
                                    {(isMounted && lease?.startDate) ? new Date(lease.startDate).toLocaleDateString('fr-CI') : "---"}
                                </span>
                            </div>
                        </div>
                   </div>

                   <div className="flex items-center gap-3 bg-white border border-slate-200/70 p-3 rounded-xl mt-5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            👤
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Bailleur désigné</p>
                            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                                {lease.landlord?.firstName} {lease.landlord?.lastName}
                            </p>
                        </div>
                   </div>
                </BentoItem>

                {/* UTILITIES WIDGET (4 cols) */}
                <BentoItem className="md:col-span-4 p-7 flex flex-col justify-between" delay={0.3}>
                    <div>
                        <div className="flex items-baseline justify-between mb-5">
                             <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                 <Zap size={15} className="text-amber-500" />
                                 <span>Énergie & Factures</span>
                             </h3>
                             <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                 OCR Live
                             </span>
                        </div>

                        <div className="space-y-3">
                            {utilities.length > 0 ? (
                                utilities.slice(0, 2).map((u: any, i: number) => (
                                    <div 
                                        key={i} 
                                        className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            u.typeUtility === "CIE" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                                        }`}>
                                            {u.typeUtility}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-xs font-bold text-slate-800">{u.montantTotal} XOF</p>
                                                <span className="text-[10px] text-slate-400">À jour</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[80%]" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl">
                                    <Zap className="text-slate-300 mx-auto mb-1.5" size={24} />
                                    <p className="text-xs text-slate-400 font-medium">Aucune facture en attente</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Link 
                        href="/mon-espace-locataire/cie-sodeci" 
                        className="mt-6 block text-center py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Scanner une facture CIE / SODECI
                    </Link>
                </BentoItem>

                {/* SMALL ACTION CARD: Receipts (3 cols) */}
                <BentoItem className="md:col-span-3 p-7 flex flex-col justify-between hover:bg-slate-900 hover:text-white transition-colors duration-300 group" delay={0.4}>
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all">
                        <Receipt size={20} />
                    </div>
                    <div className="my-4">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-1">Quittances</h3>
                        <p className="text-xs opacity-70 leading-relaxed font-medium">
                            Téléchargez vos reçus fiscaux et justificatifs horodatés.
                        </p>
                    </div>
                    <Link 
                        href="/mon-espace-locataire/receipts" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold group-hover:text-amber-300 transition-colors"
                    >
                        <span>Accéder aux quittances</span>
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                {/* SERVICES RAPIDES : 3 x 4 cols */}
                <BentoItem className="md:col-span-4 p-5 flex items-center justify-between border border-slate-200/80 hover:border-slate-300 transition-colors group" delay={0.5}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900">Centre de Recours</h3>
                            <p className="text-[11px] text-slate-400">Signalement ou médiation</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/rights" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                <BentoItem className="md:col-span-4 p-5 flex items-center justify-between border border-slate-200/80 hover:border-slate-300 transition-colors group" delay={0.55}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900">Guide Officiel</h3>
                            <p className="text-[11px] text-slate-400">Droits et loi N° 2019-576</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/manual" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                <BentoItem className="md:col-span-4 p-5 flex items-center justify-between border border-slate-200/80 hover:border-slate-300 transition-colors group" delay={0.6}>
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                            <Headset size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900">Support QAPRIL</h3>
                            <p className="text-[11px] text-slate-400">Assistance 7j/7</p>
                        </div>
                    </div>
                    <Link href="/contact" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                {/* MATCHING TINDER IMMO CARD (12 cols) */}
                <BentoItem className="md:col-span-12 p-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border border-amber-200/60 shadow-sm group overflow-hidden" delay={0.65}>
                    <div className="flex items-center gap-5 relative z-10 w-full md:w-auto mb-6 md:mb-0">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-100 shrink-0">
                            🔥
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight mb-1">
                                QAPRIL Match · Trouver mon futur logement
                            </h3>
                            <p className="text-xs font-medium text-slate-500 max-w-xl leading-relaxed">
                                Définissez vos critères (communes, budget max, typologie) et recevez des propositions directes de bailleurs vérifiés sans intermédiaire.
                            </p>
                        </div>
                    </div>
                    <Link 
                        href="/mon-espace-locataire/profil-public" 
                        className="w-full md:w-auto relative z-10 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
                    >
                        <Search size={15} />
                        <span>Configurer mes critères</span>
                    </Link>
                </BentoItem>

            </div>

            {/* 3. Footer Branding */}
            <footer className="pt-12 pb-6 flex flex-col items-center gap-4 text-center">
                <div className="h-px w-full max-w-xs bg-slate-200/60" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    QAPRIL · Protocole de Sécurisation Locative Certifié
                </span>
            </footer>
        </motion.div>
    )
}
