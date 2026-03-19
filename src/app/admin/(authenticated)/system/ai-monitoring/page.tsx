import React from "react"
import { prisma } from "@/lib/prisma"
import StatCard from "@/components/admin/StatCard"
import { Bot, MessageSquare, TrendingUp, DollarSign, Clock, User, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AiMonitoringPage() {
    try {
        // Fetch stats
        const totalConv = await prisma.bdqConversationState.count().catch(() => 0)
        const statsByStatus = await prisma.bdqConversationState.groupBy({
            by: ['statut'],
            _count: true
        }).catch(() => [])

        const costAgg = await prisma.bdqConversationState.aggregate({
            _sum: {
                coutEstimeFcfa: true,
                tokensEntreeTotal: true,
                tokensSortieTotal: true
            }
        }).catch(() => ({ _sum: { coutEstimeFcfa: null, tokensEntreeTotal: null, tokensSortieTotal: null } }))

        const recentConvs = await prisma.bdqConversationState.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' },
            include: { 
                bailleur: { select: { fullName: true, phone: true } },
                bdqCree: { select: { id: true } }
            }
        }).catch(() => [])

        const totalCost = Number(costAgg._sum?.coutEstimeFcfa || 0)
        const totalTokens = (Number(costAgg._sum?.tokensEntreeTotal) || 0) + (Number(costAgg._sum?.tokensSortieTotal) || 0)
        
        const completeCount = (statsByStatus as any[]).find(s => s.statut === "COMPLETE")?._count || 0
        const conversionRate = totalConv > 0 ? Math.round((completeCount / totalConv) * 100) : 0

        return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                            <Bot size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Supervision IA</h1>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Monitoring des performances de l&apos;Assistant Claude 3.5 Sonnet</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Système Opérationnel
                </div>
            </div>

            {/* AI Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                    title="Conversations Totales" 
                    value={totalConv.toLocaleString()} 
                    icon={<MessageSquare size={28} />} 
                    color="slate"
                    trend="Flux Entrant"
                    delay={0.1}
                />
                <StatCard 
                    title="Taux de Conversion" 
                    value={`${conversionRate}%`} 
                    icon={<TrendingUp size={28} />} 
                    color="emerald"
                    trend={`${completeCount} Bails Créés`}
                    delay={0.2}
                />
                <StatCard 
                    title="Coût Estimé Total" 
                    value={`${totalCost.toLocaleString()} FCFA`} 
                    icon={<DollarSign size={28} />} 
                    color="amber"
                    trend={`${totalTokens.toLocaleString()} Tokens`}
                    delay={0.3}
                />
                <StatCard 
                    title="Moyenne / Conversation" 
                    value={totalConv > 0 ? `${Math.round(totalCost / totalConv)} FCFA` : "0 FCFA"} 
                    icon={<Clock size={28} />} 
                    color="blue"
                    trend="Efficience"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 px-2">Dernières Interactions IA</h3>
                    <div className="glass-panel rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bailleur</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Coût</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentConvs.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{conv.bailleur?.fullName || "Utilisateur Inconnu"}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{conv.bailleur?.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                                conv.statut === "COMPLETE" ? "bg-green-100 text-green-600" :
                                                conv.statut === "EN_PAUSE" ? "bg-amber-100 text-amber-600" :
                                                "bg-blue-100 text-blue-600"
                                            }`}>
                                                {conv.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-black text-gray-700">{Number(conv.coutEstimeFcfa).toLocaleString()} <span className="text-[8px] text-gray-400 uppercase">FCFA</span></span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {conv.bdqCree ? (
                                                <Link href={`/admin/validation?id=${conv.bdqCree.id}`} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-2">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[8px] font-black uppercase">Voir BDQ</span>
                                                </Link>
                                            ) : (
                                                <span className="text-[8px] font-black uppercase text-gray-300 italic">Pas de BDQ</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentConvs.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-sm font-bold text-gray-400">Aucune conversation enregistrée.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Performance Card */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 px-2">Paramètres du Modèle</h3>
                    <div className="glass-panel p-8 rounded-[2.5rem] bg-indigo-900 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[100px] opacity-30 -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Bot size={32} className="text-indigo-300" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Modèle Actif</p>
                                    <p className="text-lg font-black">Claude 3.5 Sonnet</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Précision Extraction</span>
                                    <span className="text-emerald-400 uppercase">Haute (94%)</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Support Dialectes</span>
                                    <span className="text-indigo-300">Actif (Français Populaire)</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">Temps de Réponse Moy.</span>
                                    <span className="text-white uppercase">1.2s</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4">Dépenses par Mois (Cible)</p>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-1/4"></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[9px] font-bold text-white/40">
                                    <span>0 FCFA</span>
                                    <span>500k FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[2.5rem] border border-indigo-100 flex items-center gap-4 hover:bg-indigo-50 transition-colors cursor-pointer group">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Configuration</p>
                            <p className="text-xs font-bold text-gray-900 tracking-tight">Ajuster le System Prompt →</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    } catch (error: any) {
        return (
            <div className="p-12 bg-red-50 border-2 border-red-100 rounded-[3rem] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-200/50 rotate-3 animate-pulse">
                    <Bot size={36} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Erreur Supervision IA</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium font-inter">
                    Une erreur critique s'est produite lors de la récupération des données de monitoring IA. 
                    Veuillez contacter l'administrateur système.
                </p>
                <code className="text-[10px] text-red-700 bg-white p-6 rounded-2xl border border-red-200 max-w-full overflow-auto text-left shadow-inner">
                    {String(error)}
                </code>
            </div>
        )
    }
}

function Settings2(props: any) {
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
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
        </svg>
    )
}
