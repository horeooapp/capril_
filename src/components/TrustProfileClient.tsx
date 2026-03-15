"use client"

import { motion } from "framer-motion"

interface TrustEvent {
    id: string;
    calculatedAt?: string;
    createdAt: string;
    score: number;
    grade: string;
}

interface TrustData {
    reliabilityScore: number;
    reliabilityScores?: TrustEvent[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function TrustProfileClient({ data }: { data: TrustData }) {
    const score = data.reliabilityScore
    
    // Logic for score level
    let level = "Satisfaisante"
    let color = "text-blue-500"
    let accentColor = "bg-blue-500"

    if (score >= 850) {
        level = "Confiance Élevée"
        color = "text-green-500"
        accentColor = "bg-green-500"
    } else if (score < 400) {
        level = "Confiance Très Faible"
        color = "text-rose-500"
        accentColor = "bg-rose-500"
    } else if (score < 550) {
        level = "Confiance Fragile"
        color = "text-orange-500"
        accentColor = "bg-orange-500"
    } else if (score < 700) {
        level = "Confiance Modérée"
        color = "text-amber-500"
        accentColor = "bg-amber-500"
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                    Votre Score ICL.
                </h1>
                <p className="text-gray-500 font-medium tracking-wide">
                    Indice de Confiance Locatif : votre réputation numérique certifiée.
                </p>
            </div>

            {/* Score Jauge Premium */}
            <motion.div variants={item} className="glass-panel rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100/50">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 1000) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${accentColor}`}
                     />
                </div>
                
                <div className="relative mb-8">
                    <div className="text-center">
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="text-[10rem] font-black text-gray-900 leading-none tracking-tighter block"
                        >
                            {score}
                        </motion.span>
                        <p className="label-tech text-lg -mt-4 opacity-50">Points Certifiés</p>
                    </div>
                </div>

                <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white shadow-sm font-black uppercase tracking-widest text-xs mb-4 ${accentColor} text-white`}>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        {level}
                    </div>
                    <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                        Le score ICL est dynamique. Il reflète votre intégrité locative basée sur vos antécédents de paiement et de gestion.
                    </p>
                </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Historique Table */}
                <div className="lg:col-span-2 glass-panel rounded-[2.5rem] overflow-hidden">
                    <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="label-tech text-gray-900">Registre Historique</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-50">
                                {(data.reliabilityScores ?? []).length === 0 ? (
                                    <tr>
                                        <td className="px-10 py-20 text-center text-gray-400 font-medium italic">
                                            Aucun impact détecté. Score initial de 750 activé.
                                        </td>
                                    </tr>
                                ) : (
                                    (data.reliabilityScores ?? []).map((event) => (
                                        <tr key={event.id} className="hover:bg-white transition-colors">
                                            <td className="px-10 py-6">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                                    {new Date(event.calculatedAt ?? event.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="text-sm font-extrabold text-gray-800 uppercase tracking-tighter">
                                                    Grade {event.grade} — Certification
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="text-lg font-black text-blue-500 tracking-tighter">
                                                    {event.score} pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Tips */}
                <div className="space-y-8">
                    <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-white shadow-sm">
                        <h3 className="label-tech text-orange-600 mb-6 flex items-center gap-2">
                             Optimisation
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Ponctualité mensuelle (+5 pts)",
                                "Stabilité contractuelle (+2 pts)",
                                "Sorties sans litige (+20 pts)",
                                "Certifications d'entretien"
                            ].map((tip, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-orange-900/70">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-blue-600 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <h3 className="label-tech text-white/50 mb-6 relative z-10">Bénéfices</h3>
                        <p className="text-xs text-white/60 leading-relaxed font-medium relative z-10">
                            Un score d&apos;excellence réduit vos dépôts de garantie et vous donne accès à des tarifs préférentiels sur nos services d&apos;assurance.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
