"use client"

import { 
    TrendingUp, 
    AlertTriangle, 
    ShieldCheck, 
    FileBadge, 
    Calendar, 
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    Settings,
    MessageSquare,
    ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardLocataireClientProps {
    data: any
    session: any
}

export default function DashboardLocataireClient({ data, session }: DashboardLocataireClientProps) {
    const { profile, nextPaymentInDays, expectedPaymentDate, currentReceipt } = data
    const score = profile?.scoreActuel || 0
    const badge = profile?.scoreBadge || "D"

    const getBadgeColor = (b: string) => {
        if (b === "A+") return "text-emerald-500 bg-emerald-50 border-emerald-100"
        if (b === "A") return "text-green-500 bg-green-50 border-green-100"
        if (b === "B") return "text-blue-500 bg-blue-50 border-blue-100"
        if (b === "C") return "text-orange-500 bg-orange-50 border-orange-100"
        return "text-red-500 bg-red-50 border-red-100"
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section: Welcome & Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-8 md:p-10 rounded-[3rem] border border-white/40 shadow-xl bg-gradient-to-br from-white/80 to-blue-50/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-4">
                            Bonjour, {session?.user?.name?.split(' ')[0] || 'Locataire'}.
                        </h1>
                        <p className="text-gray-500 font-medium mb-8 max-w-md">
                            Votre espace personnel QAPRIL est à jour. Suivez vos paiements, certifiez votre caution et valorisez votre sérieux.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <Link href="/locataire/signalements" className="flex items-center gap-2 px-6 py-3 bg-[#C55A11] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-[#a64a0e] transition-all shadow-lg active:scale-95">
                                <AlertTriangle size={16} />
                                Signaler un problème
                            </Link>
                            <Link href="/locataire/passeport" className="flex items-center gap-2 px-6 py-3 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-[#163a5a] transition-all shadow-lg active:scale-95">
                                <FileBadge size={16} />
                                Mon Passeport
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Score Widget */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-white flex flex-col items-center justify-center text-center group">
                    <div className="relative mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364.4}
                                initial={{ strokeDashoffset: 364.4 }}
                                animate={{ strokeDashoffset: 364.4 - (364.4 * score) / 1000 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-[#1F4E79]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-[#1F4E79]">{score}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">/ 1000 Pts</span>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border mb-2 text-[12px] font-black uppercase tracking-widest ${getBadgeColor(badge)}`}>
                        Grade {badge}
                    </div>
                    <p className="text-[14px] text-gray-400 font-medium">Indice de Confiance Locatif</p>
                    <Link href="/locataire/trust" className="mt-4 text-[12px] font-black text-[#1F4E79] uppercase tracking-widest hover:underline flex items-center gap-1">
                        Comment progresser ? <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Alertes Procédures - RCL/MRL */}
            {(data.bails?.some((b: any) => b.reclamations?.length > 0) || data.bails?.some((b: any) => b.dossiersLitige?.length > 0)) && (
                <div className="px-2">
                    <div className="bg-white border-2 border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <ShieldCheck size={14} />
                            Procédures de Dialogue Actives
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.bails?.flatMap((b: any) => b.reclamations || []).map((ticket: any, idx: number) => (
                                <Link 
                                    key={idx} 
                                    href="/locataire/rights"
                                    className="bg-orange-50 border border-orange-100/50 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-orange-100 transition-all font-bold"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                            ⚖️
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1F4E79] uppercase tracking-tight">
                                                Révision de Loyer (RCL)
                                            </div>
                                            <div className="text-[11px] font-bold text-orange-600 italic mt-0.5">
                                                En attente de réponse bailleur
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-orange-300 group-hover:translate-x-1" />
                                </Link>
                            ))}
                            {data.bails?.flatMap((b: any) => b.dossiersLitige || []).map((mrl: any, idx: number) => (
                                <Link 
                                    key={idx} 
                                    href="/locataire/rights"
                                    className="bg-blue-50 border border-blue-100/50 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-blue-100 transition-all font-bold"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                            🤝
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1F4E79] uppercase tracking-tight">
                                                Médiation (MRL-01)
                                            </div>
                                            <div className="text-[11px] font-bold text-blue-600 italic mt-0.5">
                                                Consentement requis
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-blue-300 group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Middle Section: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Prochaine échéance */}
                <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Échéance</p>
                        <p className="text-lg font-black text-[#1F4E79]">J-{nextPaymentInDays}</p>
                    </div>
                </div>

                {/* Statut Loyer */}
                <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${currentReceipt?.status === 'paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Loyer en cours</p>
                        <p className={`text-lg font-black ${currentReceipt?.status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {currentReceipt?.status === 'paid' ? 'Acquitté' : 'À payer'}
                        </p>
                    </div>
                </div>

                {/* Caution */}
                <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Caution</p>
                        <Link href="/locataire/cautions" className="text-lg font-black text-[#1F4E79] hover:text-primary transition-colors">
                            {data.caution ? 'Certifiée' : 'À certifier'}
                        </Link>
                    </div>
                </div>

                {/* Alerte config */}
                <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Taux de sérieux</p>
                        <p className="text-lg font-black text-purple-600">{profile?.tauxPaiement12m || 0}%</p>
                    </div>
                </div>
            </div>

            {/* Mon Bail Summary - Rule 3.2 Strict Anonymity */}
            {data.bails?.length > 0 && (
                <div className="px-2">
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white/40">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                    🏠
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter leading-none italic">Mon Bail Actif.</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C55A11] mt-1.5 flex items-center gap-2">
                                        <ShieldCheck size={12} />
                                        Protection des données (Rule 3.2)
                                    </p>
                                </div>
                            </div>
                            <Link href="/locataire/leases" className="px-6 py-2 bg-white/50 hover:bg-white border border-white/80 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all text-xs">
                                Gérer mon bail
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Propriétaire / Gestionnaire</span>
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-[#1F4E79] leading-none uppercase tracking-tighter">
                                        {data.bails[0].typeGestion === 'agreee' 
                                            ? `Bailleur Masqué (${data.bails[0].landlord?.landlordCode || "AGREEE"})` 
                                            : (data.bails[0].bailleurMasque 
                                                ? `Bailleur Masqué (${data.bails[0].landlord?.landlordCode || "PRIVE"})` 
                                                : (data.bails[0].landlord?.fullName || "Non renseigné"))}
                                    </p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {data.bails[0].typeGestion === 'agreee' 
                                            ? "Agence agréée — substitution totale" 
                                            : (data.bails[0].bailleurMasque ? "Identité masquée" : "Gestion directe")}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Logement / Code</span>
                                <p className="text-lg font-black text-[#1F4E79] leading-none uppercase tracking-tighter">
                                    {data.bails[0].property?.propertyCode || "LOG-XXXX"}
                                </p>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {data.bails[0].property?.address || "Cocody, Abidjan"}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Référence Bail</span>
                                <p className="text-lg font-black text-[#1F4E79] leading-none uppercase tracking-tighter">
                                    {data.bails[0].leaseReference || "BAIL-XXXX"}
                                </p>
                                <span className="text-[9px] font-bold text-[#C55A11] uppercase tracking-tighter italic">
                                    SHA-256 Certifié {data.bails[0].sha?.substring(0, 8) || "..."}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section: Quittances Récentes & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter">Quittances Récentes</h2>
                        <Link href="/locataire/leases" className="text-[12px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1F4E79]">Voir tout</Link>
                    </div>
                    
                    {data.quittances.length > 0 ? (
                        <div className="space-y-4">
                            {data.quittances.map((q: any) => (
                                <div key={q.id} className="glass-panel p-5 rounded-[1.5rem] border border-white/40 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1F4E79]">{q.periodMonth}</p>
                                            <p className="text-[12px] text-gray-400 uppercase font-black tracking-widest">Réf: {q.receiptRef}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <p className="font-black text-[#1F4E79]">{Number(q.totalAmount).toLocaleString()} FCFA</p>
                                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Payé</span>
                                        </div>
                                        <Link href={`/receipts/${q.id}`} target="_blank" className="p-2 bg-gray-50 rounded-xl hover:bg-[#1F4E79] hover:text-white transition-colors">
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 glass-panel rounded-[2rem] text-center">
                            <p className="text-gray-400 font-medium">Bientôt disponible dès votre premier paiement.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Mini Utility Panels */}
                <div className="space-y-6">
                    {/* Alerte J-3 Panel */}
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg bg-orange-50/20">
                         <h3 className="font-black text-[#1F4E79] uppercase tracking-tighter mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-[#C55A11]" />
                            Rappels Automatiques
                         </h3>
                         <div className="space-y-3">
                             <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/80">
                                 <span className="text-[13px] font-bold text-gray-600">Alerte J-3</span>
                                 <div className={`w-8 h-4 rounded-full relative ${profile?.alerteJ3Active ? 'bg-[#375623]' : 'bg-gray-300'}`}>
                                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${profile?.alerteJ3Active ? 'right-0.5' : 'left-0.5'}`}></div>
                                 </div>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/80">
                                 <span className="text-[13px] font-bold text-gray-600">Alerte J-1</span>
                                 <div className={`w-8 h-4 rounded-full relative ${profile?.alerteJ1Active ? 'bg-[#375623]' : 'bg-gray-300'}`}>
                                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${profile?.alerteJ1Active ? 'right-0.5' : 'left-0.5'}`}></div>
                                 </div>
                             </div>
                         </div>
                         <Link href="/locataire/preferences" className="mt-4 block text-[11px] font-black text-center text-gray-400 uppercase tracking-widest hover:text-[#1F4E79]">
                             Configurer mes canaux (SMS/WhatsApp)
                         </Link>
                    </div>

                    {/* Preavis Panel */}
                    <Link href="/locataire/preavis" className="block glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-black text-[#1F4E79] uppercase tracking-tighter mb-1">Préavis Officiel</h3>
                                <p className="text-[13px] text-gray-500 font-medium">Déclarez votre départ en respectant le cadre légal.</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[#1F4E79] group-hover:text-white transition-colors">
                                <MessageSquare size={20} />
                            </div>
                        </div>
                    </Link>

                    {/* Dossier Locatif Panel */}
                    <Link href="/locataire/passeport" className="block glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#1F4E79]"></div>
                        <h3 className="font-black text-[#1F4E79] uppercase tracking-tighter mb-1">Dossier de Location</h3>
                        <p className="text-[13px] text-gray-500 font-medium mb-4">Exportez votre dossier certifié QAPRIL pour vos futurs bails.</p>
                        <span className="block w-full py-3 bg-[#1F4E79] text-white text-center rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                            Voir & Exporter
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
