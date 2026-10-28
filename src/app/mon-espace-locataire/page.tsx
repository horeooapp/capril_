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
    Users
} from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import NotificationCenter from "@/components/dashboard/NotificationCenter"
import { confirmBDQFromDashboard } from "@/actions/lease.actions"

// Badge component defined outside to avoid ReferenceError in early returns
const Badge = ({ label, color, bg, size = 10 }: any) => (
    <span 
        style={{ backgroundColor: bg, color: color, fontSize: `${size}px` }} 
        className="px-3 py-1 rounded-full font-black uppercase tracking-widest"
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
                <div className="w-12 h-12 border-4 border-qnavy-pale border-t-qnavy rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Synchronisation sécurisée...</p>
            </div>
        )
    }

    if (!dashboardData?.success) {
        return (
            <div className="flex items-center justify-center p-8 text-center text-qred bg-qred-pale border-2 border-qred/20 rounded-2xl max-w-lg mx-auto mt-12 overflow-hidden">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <AlertCircle className="mx-auto mb-4 text-qred" size={32} />
                    <p className="font-black uppercase tracking-tight">Erreur Critique</p>
                    <p className="text-sm mt-2">{dashboardData?.error || "Incapable de joindre le serveur d'authentification."}</p>
                </motion.div>
            </div>
        )
    }

    if (!dashboardData.hasLease) {
        const pending = dashboardData.pendingDeclarations || [];

        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden py-20">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-qnavy/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <motion.div 
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-4xl"
                >
                    {pending.length > 0 ? (
                        <div className="space-y-12">
                             <div className="space-y-4">
                                <div className="w-20 h-20 bg-qorange-pale rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-qorange/10 mx-auto mb-6">🔔</div>
                                <h1 className="text-3xl md:text-5xl font-black text-qnavy-dark tracking-tighter uppercase leading-tight italic">
                                    Invitation M-SIGN <br /> Reçue.
                                </h1>
                                <p className="text-qtext-mid max-w-xl mx-auto font-medium leading-relaxed">
                                    Un gérant immobilier a déclaré votre occupation. Confirmez pour activer votre bail digital et votre <strong>Passeport Confiance</strong>.
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {pending.map((bdq: any) => (
                                    <div key={bdq.id} className="bg-white border border-qgrey-2 p-8 rounded-[2.5rem] shadow-xl shadow-qnavy/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-qnavy/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                                        
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <Badge label="BAIL DÉCLARATIF" color="#C55A11" bg="#FFF4ED" size={9} />
                                                <span className="text-[10px] font-mono text-qtext-light">{bdq.id.substring(0,8).toUpperCase()}</span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-qnavy-dark uppercase tracking-tighter mb-1">
                                                    {bdq.property?.name || bdq.descriptionLogement.split(',')[0]}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-qtext-light">
                                                    <MapPin size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{bdq.property?.commune || "Adresse déclarée"}</span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] font-black uppercase text-slate-400">Loyer</span>
                                                    <span className="text-sm font-black text-qnavy">{bdq.loyerDeclareMensuel.toLocaleString()} XOF</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] font-black uppercase text-slate-400">Bailleur</span>
                                                    <span className="text-[10px] font-bold text-slate-600">{bdq.bailleur?.firstName} {bdq.bailleur?.lastName}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <button 
                                                    disabled={isPending}
                                                    onClick={async () => {
                                                        startTransition(async () => {
                                                            const res = await confirmBDQFromDashboard(bdq.id, "OUI");
                                                            if (res.success) {
                                                                toast.success("Bail confirmé ! Félicitations.");
                                                                window.location.reload();
                                                            } else {
                                                                toast.error(res.error || "Erreur lors de la confirmation.");
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center justify-center gap-2 bg-qgreen hover:bg-qgreen-dark text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                                >
                                                    <CheckCircle size={16} /> Confirmer
                                                </button>
                                                <button 
                                                    disabled={isPending}
                                                    onClick={async () => {
                                                        const motif = prompt("Veuillez indiquer le motif de contestation :");
                                                        if (!motif) return;
                                                        startTransition(async () => {
                                                            const res = await confirmBDQFromDashboard(bdq.id, "NON", motif);
                                                            if (res.success) {
                                                                toast.info("Déclaration contestée. Médiation ouverte.");
                                                                window.location.reload();
                                                            } else {
                                                                toast.error(res.error || "Erreur.");
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center justify-center gap-2 bg-white border border-qgrey-2 text-qred hover:bg-qred-pale font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                                >
                                                    <XCircle size={16} /> Contester
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-28 h-28 bg-white border border-qgrey-2 rounded-[2rem] flex items-center justify-center text-5xl shadow-xl shadow-qnavy/5 mb-8 mx-auto">🏠</div>
                            <h1 className="text-4xl font-black text-qnavy-dark mb-6 tracking-tighter leading-tight uppercase">
                                Prêt à habiter <br /> en toute sérénité ?
                            </h1>
                            <p className="text-qtext-mid max-w-md mx-auto mb-10 font-medium leading-relaxed">
                                Aucun bail actif n'est rattaché à votre compte ({dashboardData.user?.phone || 'Profil incomplet'}). 
                                Digitalisez votre location pour profiter du <strong>Passeport Confiance QAPRIL</strong>.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/onboarding/tenant" className="bg-qnavy hover:bg-qnavy-dark text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-qnavy/20 transition-all hover:-translate-y-1 uppercase tracking-widest text-xs">
                                    Compléter mon Profil
                                </Link>
                                <button onClick={() => router.push('/contact')} className="bg-white border border-qgrey-2 text-qnavy-dark font-black px-10 py-5 rounded-2xl hover:bg-qgrey-1 transition-all uppercase tracking-widest text-xs">
                                    Aide & Support
                                </button>
                            </div>
                        </>
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
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    }



    // Bento Grid Item Wrapper
    const BentoItem = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
        <motion.div 
            variants={itemVariants}
            className={`premium-stat-card overflow-hidden group relative bg-white ${className}`}
        >
            {children}
        </motion.div>
    )

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1200px] mx-auto px-4 py-8 space-y-10"
        >
            {/* 1. Header & Quick Status */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-qgreen animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-qtext-light italic">Espace Client Certifié</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-qnavy-dark tracking-tighter uppercase leading-none"
                    >
                        Bonjour, <span className="text-qgreen whitespace-nowrap">{dashboardData.user?.firstName || 'Locataire'}</span>
                    </motion.h1>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white shadow-xl shadow-qnavy/5 w-full sm:w-auto"
                >
                    <div className="flex -space-x-2 overflow-hidden ml-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-qgrey-1 flex items-center justify-center text-[10px] font-bold">
                                {i === 3 ? "⚡" : "👤"}
                            </div>
                        ))}
                    </div>
                    <div className="pr-6 flex-1 sm:flex-none overflow-hidden">
                        <p className="text-[8px] font-black uppercase tracking-widest text-qtext-light leading-none mb-1">Dernière Quittance</p>
                        <p className="text-[10px] font-black text-qnavy-dark uppercase tracking-tighter truncate">
                            {lease.lastReceiptDate 
                                ? `Le ${new Date(lease.lastReceiptDate).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                : "Aucune émise"}
                        </p>
                    </div>
                    <div className="border-l border-qgrey-2 pl-2 pr-4 h-10 flex items-center">
                        <NotificationCenter variant="tenant" />
                    </div>
                </motion.div>
            </header>

            {/* 2. The Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min md:auto-rows-[160px]">
                
                {/* PRIMARY HERO: Rent & Payment (6 cols, 2 rows) */}
                <BentoItem className="md:col-span-8 md:row-span-2 p-6 sm:p-8 flex flex-col justify-between bg-qnavy-dark text-white border-none shadow-2xl shadow-qnavy/30 group min-h-[220px]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(26,61,140,0.4),transparent_60%)] pointer-events-none"></div>
                    
                    <div className="z-10">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Loyer du Mois</span>
                            <div className="h-8 w-8 bg-qgreen rounded-full flex items-center justify-center shadow-lg shadow-qgreen/40">
                                <ShieldCheck size={16} />
                            </div>
                        </div>
                        
                        <div className="flex items-baseline gap-2 overflow-hidden">
                            <span className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none italic whitespace-nowrap text-[#FF8200]">
                                {lease.rentAmount.toLocaleString()}
                            </span>
                            <span className="text-sm sm:text-xl font-medium opacity-70 uppercase tracking-widest italic text-[#FF8200]/80">XOF</span>
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-qgreen-light mt-4 max-w-xs uppercase tracking-widest">
                            Date limite : <span className="font-black text-white px-2 py-0.5 bg-qgreen/20 rounded-lg mx-1 whitespace-nowrap">
                                {new Date(lease.rentDeadline).toLocaleDateString('fr-CI', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </p>
                    </div>

                    <div className="mt-6 sm:mt-8 flex gap-3 z-10">
                        <Link href="/mon-espace-locataire/payment" className="flex-1 bg-white text-qnavy-dark hover:bg-qgrey-1 font-black rounded-2xl px-6 py-4 text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2">
                           Régler maintenant <ArrowUpRight size={18} />
                        </Link>
                        <button className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all" onClick={(e) => { e.preventDefault(); router.push('/mon-espace-locataire/receipts') }}>
                            <Download size={20} />
                        </button>
                    </div>
                </BentoItem>

                {/* ICL SCORE CARD (4 cols, 2 rows) */}
                <BentoItem className="md:col-span-4 md:row-span-2 p-8 flex flex-col justify-between bg-white border-qgrey-2 group" delay={0.1}>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-qgreen-pale text-qgreen rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                            <ShieldCheck size={12} /> Passeport Actif
                        </div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">Score de Confiance ICL</p>
                        <div className="text-6xl font-black text-qnavy-dark tracking-tighter leading-none">{dashboardData.score}</div>
                        <p className="text-[11px] font-medium text-qtext-mid mt-4 leading-relaxed">
                            Excellent profil. Vous bénéficiez de <span className="font-black text-qgreen uppercase">-10% sur votre caution</span> pour votre prochain déménagement.
                        </p>
                    </div>
                    
                    <Link href="/mon-espace-locataire/passeport" className="w-full text-center py-4 rounded-xl border border-dashed border-qgrey-2 text-[10px] font-black uppercase tracking-widest text-qtext-light hover:border-qnavy/40 hover:text-qnavy transition-all group-hover:bg-qnavy-pale/30">
                        Voir les avantages →
                    </Link>
                </BentoItem>

                {/* PROPERTY CARD (5 cols, 2 rows) */}
                <BentoItem className="md:col-span-5 md:row-span-2 p-8 flex flex-col justify-between" delay={0.2}>
                   <div>
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-14 h-14 bg-qnavy-pale rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏢</div>
                             <div>
                                 <h3 className="text-xl font-black text-qnavy-dark uppercase tracking-tighter leading-tight truncate max-w-[200px]">
                                     {lease.property?.name || "Résidence Zen"}
                                 </h3>
                                 <div className="flex items-center gap-1.5 text-qtext-light">
                                     <MapPin size={12} />
                                     <span className="text-[10px] font-bold uppercase tracking-widest">
                                         {lease.property?.commune || "Quartier"}, {lease.property?.city || "Abidjan"}
                                     </span>
                                 </div>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-qgrey-1/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Contrat unique</span>
                                <span className="text-[10px] font-black text-qnavy truncate">#{lease.leaseReference}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Entrée</span>
                                <span className="text-[10px] font-black text-qnavy uppercase">
                                    {(isMounted && lease?.startDate) ? new Date(lease.startDate).toLocaleDateString('fr-CI') : "---"}
                                </span>
                            </div>
                        </div>
                   </div>

                   <div className="flex items-center gap-3 bg-qgrey-1/30 p-4 rounded-2xl mt-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs shadow-sm border border-qgrey-2">👤</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[8px] font-black text-qtext-light uppercase leading-none mb-1">Gérant / Bailleur</p>
                            <p className="text-[10px] font-black text-qnavy-dark truncate uppercase">
                                {lease.landlord?.lastName} {lease.landlord?.firstName}
                            </p>
                        </div>
                   </div>
                </BentoItem>

                {/* UTILITIES WIDGET (4 cols, 2 rows) */}
                <BentoItem className="md:col-span-4 md:row-span-2 p-8" delay={0.3}>
                    <div className="flex items-baseline justify-between mb-8">
                         <h3 className="text-[10px] font-black text-qnavy-dark uppercase tracking-[0.2em] italic">Énergie & OCR</h3>
                         <div className="text-[9px] font-black text-qorange-pale bg-qorange rounded-lg px-2 py-1 uppercase tracking-widest animate-pulse">Live</div>
                    </div>

                    <div className="space-y-3">
                        {utilities.length > 0 ? (
                            utilities.slice(0, 2).map((u: any, i: number) => (
                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    key={i} 
                                    className="flex items-center gap-3 p-4 bg-qgrey-1/20 border border-qgrey-1 rounded-2xl"
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm ${u.typeUtility === "CIE" ? "bg-qorange-pale text-qorange" : "bg-qnavy-pale text-qnavy"}`}>
                                        <Zap size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-[9px] font-black text-qnavy-dark uppercase">{u.typeUtility}</p>
                                            <p className="text-[10px] font-black text-qnavy">{u.montantTotal} F</p>
                                        </div>
                                        <div className="h-1 bg-qgrey-1 rounded-full overflow-hidden">
                                            <div className="h-full bg-qnavy w-[70%]" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-qgrey-1/10 border border-dashed border-qgrey-2 rounded-2xl">
                                <Zap className="text-qgrey-2 mb-2" size={32} />
                                <p className="text-[9px] font-black text-qtext-light uppercase tracking-widest">Aucune facture en cours</p>
                            </div>
                        )}
                    </div>

                    <Link href="/mon-espace-locataire/cie-sodeci" className="mt-8 block text-center py-4 bg-qnavy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        Scanner une facture
                    </Link>
                </BentoItem>

                {/* SMALL ACTION CARD: Receipts (3 cols, 2 rows) */}
                <BentoItem className="md:col-span-3 md:row-span-2 p-8 flex flex-col justify-between hover:bg-qnavy hover:text-white transition-colors duration-500" delay={0.4}>
                    <div className="w-12 h-12 bg-qnavy-pale text-qnavy rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-all">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest mb-2 italic">Quittances</h3>
                        <p className="text-[10px] opacity-60 font-medium">Consultez et téléchargez vos justificatifs de loyer certifiés.</p>
                    </div>
                    <Link href="/mon-espace-locataire/receipts" className="mt-auto pt-6 group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        Accéder <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                {/* LEGAL RIGHTS CARD (5 cols, 1 row) */}
                <BentoItem className="md:col-span-5 md:row-span-1 p-6 flex items-center justify-between bg-[radial-gradient(ellipse_at_right,rgba(26,61,140,0.05),transparent_70%)]" delay={0.5}>
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-qgreen-pale rounded-full flex items-center justify-center text-qgreen shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest italic leading-tight">Centre de Recours</h3>
                            <p className="text-[9px] text-qtext-mid font-medium mt-1">Maintenance ou litige.</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/rights" className="h-14 px-6 bg-white border border-qgrey-2 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm shrink-0">
                        Ouvrir
                    </Link>
                </BentoItem>

                {/* MANUAL BOX (3 cols, 1 row) */}
                <BentoItem className="md:col-span-3 md:row-span-1 p-6 flex flex-col justify-between bg-qnavy-pale border-none group hover:bg-qnavy transition-colors duration-500" delay={0.55}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-qnavy/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen size={16} className="text-qnavy" />
                        </div>
                        <p className="text-[10px] font-black text-qnavy-dark uppercase tracking-widest leading-none group-hover:text-white transition-colors">Manuel<br/>Officiel</p>
                    </div>
                    <Link href="/mon-espace-locataire/manual" className="mt-auto inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-qnavy group-hover:text-white transition-colors">
                        Consulter le guide <ArrowUpRight size={12} />
                    </Link>
                </BentoItem>

                {/* SUPPORT BOX (4 cols, 1 row) */}
                <BentoItem className="md:col-span-4 md:row-span-1 p-6 flex items-center gap-4 bg-qgrey-1/20 border-dashed" delay={0.6}>
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-qgrey-1 flex items-center justify-center">
                        <Headset size={16} className="text-qnavy" />
                    </div>
                    <div className="flex-1">
                         <p className="text-[8px] font-black text-qtext-light uppercase tracking-widest leading-none mb-1">Besoin d'aide ?</p>
                         <p className="text-[10px] font-black text-qnavy-dark leading-none">Support QAPRIL</p>
                         <div className="flex gap-4 mt-2">
                            <Link href="/contact" className="text-[9px] font-black text-qnavy hover:underline uppercase tracking-widest">Aide →</Link>
                            <Link href="/faq" className="text-[9px] font-black text-qtext-light hover:underline uppercase tracking-widest">FAQ →</Link>
                         </div>
                    </div>
                </BentoItem>

                {/* NEW ROW: LATENT SERVICES (12 cols total) */}
                <BentoItem className="md:col-span-4 md:row-span-1 p-6 flex items-center justify-between border border-qgrey-1 hover:border-qnavy/30 transition-colors group" delay={0.65}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-qorange-pale rounded-full flex items-center justify-center text-qorange">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-qnavy-dark uppercase tracking-widest leading-tight">Colocation</h3>
                            <p className="text-[9px] text-qtext-mid font-medium">Gérer les parts de loyer.</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/colocation" className="p-2 bg-qgrey-1 rounded-full group-hover:bg-qnavy group-hover:text-white transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                <BentoItem className="md:col-span-4 md:row-span-1 p-6 flex items-center justify-between border border-qgrey-1 hover:border-qnavy/30 transition-colors group" delay={0.68}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-qnavy-pale rounded-full flex items-center justify-center text-qnavy">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-qnavy-dark uppercase tracking-widest leading-tight">Préavis</h3>
                            <p className="text-[9px] text-qtext-mid font-medium">Déclarer son départ.</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/preavis" className="p-2 bg-qgrey-1 rounded-full group-hover:bg-qnavy group-hover:text-white transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                <BentoItem className="md:col-span-4 md:row-span-1 p-6 flex items-center justify-between border border-qgrey-1 hover:border-qnavy/30 transition-colors group" delay={0.71}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                            <AlertCircle size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-qnavy-dark uppercase tracking-widest leading-tight">Voisinage</h3>
                            <p className="text-[9px] text-qtext-mid font-medium">Signaler une nuisance.</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/signalements" className="p-2 bg-qgrey-1 rounded-full group-hover:bg-qnavy group-hover:text-white transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                </BentoItem>

                {/* MATCHING TINDER IMMO CARD (12 cols, 1 row) */}
                <BentoItem className="md:col-span-12 md:row-span-1 p-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-qgold/10 via-qorange-pale to-white border border-qgold/20 shadow-lg group overflow-hidden" delay={0.7}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-qgold/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center gap-6 relative z-10 w-full md:w-auto mb-6 md:mb-0">
                        <div className="w-16 h-16 bg-white rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-qgold/10">
                            <span className="text-3xl animate-bounce-slow">🔥</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-qnavy-dark uppercase tracking-tighter mb-1">Qapril Match</h3>
                            <p className="text-[12px] font-medium text-qtext-mid max-w-lg">Soumettez votre profil locatif (Budget, Communes) aux bailleurs et laissez les logements venir à vous. Matching IA instantané.</p>
                        </div>
                    </div>
                    <Link href="/mon-espace-locataire/profil-public" className="w-full md:w-auto relative z-10 h-14 px-10 bg-qnavy-dark text-white rounded-[1.2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                        <Search size={16} /> Configurer mon profil
                    </Link>
                </BentoItem>

            </div>

            {/* 3. Footer Branding */}
            <footer className="pt-20 pb-10 flex flex-col items-center gap-6 opacity-30">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-qgrey-2 to-transparent" />
                <div className="flex items-center gap-12 grayscale">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] italic leading-none">Protocole National Certifié V.4.0</span>
                </div>
            </footer>
        </motion.div>
    )
}
