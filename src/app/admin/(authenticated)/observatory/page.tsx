"use client"

import { useState, useEffect } from "react"
import { getGlobalActivityStats, getMarketInsights, getLiveEventStream, getCommunalStats } from "@/actions/observatory-actions"
import CommunalActivityMap from "@/components/admin/CommunalActivityMap"
import LiveActivityStream from "@/components/admin/LiveActivityStream"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Map as MapIcon, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react"

interface ObservatoryStats {
    totalUsers: number
    totalProperties: number
    totalLeases: number
    totalMandates: number
    activeColocs: number
    landLeases: number
    marketTrend: string
}

interface MarketInsight {
    commune: string
    avgRent: number
    sampleCount: number
}

interface CommunalStat {
    name: string
    leaseCount: number
    avgRent: number
    trend: string
}

export default function ObservatoryPage() {
    const [stats, setStats] = useState<ObservatoryStats | null>(null)
    const [insights, setInsights] = useState<MarketInsight[]>([])
    const [communalStats, setCommunalStats] = useState<CommunalStat[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function refreshData() {
        const [s, i, l, c] = await Promise.all([
            getGlobalActivityStats(),
            getMarketInsights(),
            getLiveEventStream(),
            getCommunalStats()
        ])
        setStats(s)
        setInsights(i)
        setLogs(l)
        setCommunalStats(c)
        setLoading(false)
    }

    useEffect(() => {
        refreshData()
        const interval = setInterval(refreshData, 15000) // Polling every 15s
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="text-gray-400 animate-pulse p-12 text-center font-black uppercase tracking-widest text-2xl">Initializing Command Center...</div>

    // Compute active communes from logs/insights for the map
    const activeCommuneNames = Array.from(new Set([
        ...logs.map(log => log.action?.includes("Cocody") ? "Cocody" : log.action?.includes("Plateau") ? "Plateau" : ""),
        ...insights.map(i => i.commune)
    ].filter(Boolean)))

    const mapData = activeCommuneNames.map(name => ({
        name: name as string,
        activityLevel: 1,
        x: 0, // Placeholder as CommunalActivityMap uses its own fixed x/y for now
        y: 0
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2 flex items-center gap-4">
                        <Activity className="text-indigo-500" size={40} />
                        OBSERVATOIRE NATIONAL
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">Supervision stratégique des flux immobiliers et indicateurs de marché en temps réel sur le territoire ivoirien.</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tendance Marché</span>
                        <span className="text-xl font-black text-white">{stats?.marketTrend}</span>
                    </div>
                    <TrendingUp className="text-indigo-500" size={24} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Section: Map & Indicators */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CommunalActivityMap activeCommunes={mapData as any} />
                        
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MapIcon size={14} /> Répartition Communale
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {communalStats.length === 0 ? (
                                    <p className="text-gray-500 italic text-xs">Calcul des données en cours...</p>
                                ) : communalStats.map((stat, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-all flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest text-[11px]">{stat.name}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.leaseCount} Baux Actifs</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-mono font-black text-white">{stat.avgRent.toLocaleString()} FCFA</span>
                                                {stat.trend === "up" ? (
                                                    <ChevronUp size={12} className="text-emerald-500" />
                                                ) : (
                                                    <ChevronDown size={12} className="text-rose-500" />
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Moy. Mensuelle</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-[2.5rem] grid grid-cols-2 md:grid-cols-4 gap-8">
                        <InsightBox label="Mandats" value={stats?.totalMandates} color="text-blue-400" />
                        <InsightBox label="Colocs" value={stats?.activeColocs} color="text-emerald-400" />
                        <InsightBox label="Terrains" value={stats?.landLeases} color="text-amber-400" />
                        <InsightBox label="Utilisateurs" value={stats?.totalUsers} color="text-indigo-400" />
                    </div>
                </div>

                {/* Real-time Stream Section */}
                <div className="space-y-8">
                    <LiveActivityStream logs={logs} />
                    
                    <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-indigo-400" size={20} />
                            <h4 className="font-bold text-white text-sm">Contrôle de Conformité</h4>
                        </div>
                        <p className="text-xs text-indigo-200/60 leading-relaxed italic">
                            Chaque événement capturé est horodaté et sécurisé par le moteur Proof-Chain™ QAPRIL. 
                            Toute anomalie géographique ou financière est immédiatement signalée aux agents superviseurs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InsightBox({ label, value, color }: { label: string, value: number | undefined, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-1">{label}</span>
            <span className={`text-3xl font-black ${color}`}>{value || 0}</span>
        </div>
    )
}
