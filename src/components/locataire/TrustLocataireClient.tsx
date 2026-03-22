"use client"

import { 
    Star, 
    TrendingUp, 
    ShieldCheck, 
    Zap, 
    Info,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight
} from "lucide-react"
import { motion } from "framer-motion"

export default function TrustLocataireClient({ profile }: any) {
    const score = profile?.scoreActuel || 0
    const badge = profile?.scoreBadge || "D"

    const criteria = [
        { 
            label: "Régularité de paiement", 
            score: profile?.tauxPaiement12m || 0, 
            weight: "40%", 
            desc: "Paiements à temps sur les 12 derniers mois.",
            icon: <Calendar className="text-blue-500" />
        },
        { 
            label: "Ancienneté / Durée", 
            score: (profile?.nbBailsActifs > 0 ? 100 : 0), 
            weight: "20%", 
            desc: "Stabilité dans vos derniers logements.",
            icon: <Clock className="text-purple-500" />
        },
        { 
            label: "Absence d'incidents", 
            score: 100, 
            weight: "30%", 
            desc: "Aucun signalement de dégradation ou de nuisance.",
            icon: <ShieldCheck className="text-emerald-500" />
        },
        { 
            label: "Vérification KYC", 
            score: 100, 
            weight: "10%", 
            desc: "Identité et documents certifiés QAPRIL.",
            icon: <CheckCircle2 className="text-orange-500" />
        }
    ]

    const getBadgeColor = (b: string) => {
        if (b === "A+") return "bg-emerald-500 text-white shadow-emerald-200"
        if (b === "A") return "bg-green-500 text-white shadow-green-200"
        if (b === "B") return "bg-blue-500 text-white shadow-blue-200"
        if (b === "C") return "bg-orange-500 text-white shadow-orange-200"
        return "bg-red-500 text-white shadow-red-200"
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header / Score Display */}
            <div className="glass-panel p-10 rounded-[3rem] border border-white/40 shadow-2xl bg-gradient-to-br from-white to-blue-50/30 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                
                <div className="relative">
                    <div className="w-48 h-48 rounded-full border-[12px] border-gray-50 flex flex-col items-center justify-center relative bg-white shadow-inner">
                        <span className="text-6xl font-black text-[#1F4E79] tracking-tighter">{score}</span>
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Points</span>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -bottom-4 right-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl ring-4 ring-white ${getBadgeColor(badge)}`}
                        >
                            {badge}
                        </motion.div>
                    </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2 italic">Indice ICL.</h1>
                    <p className="text-lg text-gray-500 font-medium">L'Indice de Confiance Locatif est votre meilleure recommandation pour louer sans caution ou négocier votre loyer.</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                         <div className="px-4 py-2 bg-white/60 rounded-xl border border-white/80 text-[12px] font-black text-[#1F4E79] uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#375623]" />
                            Score : {badge === 'A+' ? 'Excellent' : badge === 'A' ? 'Très Bon' : 'En progression'}
                         </div>
                         <div className="px-4 py-2 bg-white/60 rounded-xl border border-white/80 text-[12px] font-black text-[#1F4E79] uppercase tracking-widest flex items-center gap-2">
                            <Zap size={16} className="text-orange-400" />
                            Réactualisé en temps réel
                         </div>
                    </div>
                </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter flex items-center gap-3">
                        <Info size={24} className="text-blue-500" />
                        Critères de Performance
                    </h2>
                    <div className="grid gap-6">
                        {criteria.map((item, i) => (
                            <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-lg bg-white group hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center p-3">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1F4E79] uppercase tracking-tight">{item.label}</h4>
                                            <p className="text-[12px] text-gray-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Poids: {item.weight}</span>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full bg-gradient-to-r from-[#1F4E79] to-blue-400"
                                     />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits / Tips */}
                <div className="space-y-8">
                     <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-[#1F4E79] text-white">
                         <h3 className="text-xl font-black uppercase tracking-tight mb-8 italic">Privilèges Accès {badge >= 'B' ? 'Premium' : 'Standard'}</h3>
                         <div className="space-y-6">
                             {[
                                { t: "Paiement en J+3 toléré", ok: badge >= 'B' },
                                { t: "Reporting Signalement prioritaire", ok: badge >= 'A' },
                                { t: "Accès au fonds de garantie QAPRIL", ok: badge >= 'A+' },
                                { t: "Assurance Loyer Impayé réduite", ok: badge >= 'B' }
                             ].map((priv, i) => (
                                <div key={i} className="flex items-center justify-between opacity-90">
                                    <span className="font-bold text-[15px]">{priv.t}</span>
                                    {priv.ok ? (
                                        <CheckCircle2 size={24} className="text-emerald-400" />
                                    ) : (
                                        <XCircle size={24} className="text-white/20" />
                                    )}
                                </div>
                             ))}
                         </div>
                     </div>

                     <div className="glass-panel p-8 rounded-[3rem] border border-white/40 shadow-xl bg-orange-50/50">
                         <h3 className="text-xl font-black text-[#C55A11] uppercase tracking-tight mb-4">Gagner des points ?</h3>
                         <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#C55A11] text-white rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-bold">1</div>
                                <p className="text-[14px] font-medium text-gray-700">Payez vos factures Horeoo à temps via la plateforme (+20 pts).</p>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#C55A11] text-white rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-bold">2</div>
                                <p className="text-[14px] font-medium text-gray-700">Faites certifier votre caution par la CDC-CI (+50 pts).</p>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#C55A11] text-white rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-bold">3</div>
                                <p className="text-[14px] font-medium text-gray-700">Finalisez votre profil KYC à 100% (+100 pts).</p>
                             </li>
                         </ul>
                     </div>
                </div>
            </div>
        </div>
    )
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
