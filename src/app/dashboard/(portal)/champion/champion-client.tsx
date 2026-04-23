"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Copy, CheckCircle2, TrendingUp, Users, Target, ArrowRight, Wallet, UserPlus, Gift, Link } from "lucide-react"
import { toast } from "sonner"

export default function ChampionClient({ data }: { data: any }) {
    const [copied, setCopied] = useState(false)

    const handleCopyCode = () => {
        navigator.clipboard.writeText(`https://qapril.ci/join?ref=${data.codeChampion}`)
        setCopied(true)
        toast.success("Lien d'affiliation copié ! Partagez-le pour gagner des commissions.")
        setTimeout(() => setCopied(false), 3000)
    }

    if (!data.isChampion) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="text-center space-y-6 max-w-lg">
                    <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <Trophy size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Devenez Champion.</h2>
                        <p className="text-slate-500 mt-2 font-medium">Recommandez QAPRIL à des propriétaires et des locataires, et gagnez des commissions récurrentes sur chaque transaction !</p>
                    </div>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 justify-center w-full">
                        Rejoindre le programme <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )
    }

    const progressPercentage = Math.min((data.totalInscriptions / data.objectifMensuel) * 100, 100)

    return (
        <div className="space-y-8 pb-32">
            {/* HERO GAMIFICATION */}
            <div className="relative glass-panel rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-400">
                            <Trophy size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Programme Partenaire</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                            Champion <span className="text-amber-500">Gold.</span>
                        </h1>
                        <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed">
                            Faites grandir la communauté QAPRIL. Chaque propriétaire ou locataire que vous invitez vous rapporte des commissions directes.
                        </p>
                    </div>
                    
                    <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md w-full md:w-auto shrink-0 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Votre Lien Unique</p>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-700/50">
                            <div className="px-4 py-2 font-mono text-sm font-bold text-amber-400 select-all truncate max-w-[200px]">
                                qapril.ci/join?ref={data.codeChampion}
                            </div>
                            <button 
                                onClick={handleCopyCode}
                                className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gains Générés</h3>
                        <div className="flex items-end gap-1">
                            <p className="text-3xl font-black text-slate-800">{data.totalCommissionsFcfa.toLocaleString()}</p>
                            <span className="text-xs text-gray-400 font-bold mb-1.5">FCFA</span>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                        <Users size={28} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Réseau Actif</h3>
                        <div className="flex items-end gap-1">
                            <p className="text-3xl font-black text-slate-800">{data.totalInscriptions}</p>
                            <span className="text-xs text-gray-400 font-bold mb-1.5">Filleuls</span>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] bg-amber-500 border border-amber-600 shadow-lg text-white space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-20"><Target size={120} className="-mr-6 -mb-6" /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-100">Objectif du mois</h3>
                            <span className="text-xs font-bold bg-amber-600 px-2 py-0.5 rounded-full">{data.totalInscriptions} / {data.objectifMensuel}</span>
                        </div>
                        <div className="w-full bg-amber-700/30 rounded-full h-3 mb-1 overflow-hidden backdrop-blur-sm">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-white h-full rounded-full"
                            ></motion.div>
                        </div>
                        <p className="text-[10px] font-bold text-amber-100">Plus que {data.objectifMensuel - data.totalInscriptions} pour débloquer le palier Platinum !</p>
                    </div>
                </div>
            </div>

            {/* LISTE DES PROSPECTS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Activité de votre réseau</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-1 hover:text-amber-600 transition-colors">
                        Voir tout <ArrowRight size={12} />
                    </button>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Contact</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Date</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500">Statut</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {data.recentProspects.map((prospect: any) => (
                                    <tr key={prospect.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                    {prospect.type === 'LOCATAIRE' ? <UserPlus size={18} /> : <Gift size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{prospect.nom}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{prospect.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-500 font-medium">
                                            {prospect.date}
                                        </td>
                                        <td className="p-5">
                                            {prospect.statut === 'CONVERTI' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Converti
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                    <TrendingUp size={12} /> En discussion
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right font-black text-slate-800">
                                            {prospect.commission > 0 ? (
                                                <span className="text-emerald-500">+{prospect.commission.toLocaleString()} FCFA</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
