"use client"

import { motion } from "framer-motion"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"
import Link from "next/link"

interface DashboardProperty {
    id: string;
    name?: string | null;
    address: string;
    city: string;
    neighborhood: string;
    leases: Array<{
        id: string;
        cdcDeposits: Array<{ amount: number }>;
        receipts?: Array<{ paidAt: Date | string | null }>;
    }>;
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

export default function DashboardOverviewClient({ 
    user, 
    properties,
    regularizationAlert
}: { 
    user: any, 
    properties: any[],
    regularizationAlert?: React.ReactNode
}) {
    const totalProperties = properties.length
    const totalLeases = properties.reduce((acc: number, current: DashboardProperty) => acc + (current.leases?.length || 0), 0)

    let totalSecuredFunds = 0
    properties.forEach((p: DashboardProperty) => {
        p.leases?.forEach((l) => {
            if (l.cdcDeposits?.[0]?.amount) totalSecuredFunds += l.cdcDeposits[0].amount
        })
    })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    let receiptsThisMonth = 0
    properties.forEach((p: DashboardProperty) => {
        p.leases?.forEach((l) => {
            if (l.receipts) {
                receiptsThisMonth += l.receipts.filter((r) => r.paidAt && new Date(r.paidAt) >= startOfMonth).length
            }
        })
    })

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                        Patrimoine.
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Bienvenue, <span className="text-gray-900 font-bold">{user?.name || user?.email || "Gestionnaire"}</span>. État actuel de vos actifs.
                    </p>
                </div>
                {user && <ReliabilityBadge score={750} />}
            </div>

            {regularizationAlert}

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Logements gérés", value: totalProperties, accent: "bg-orange-500", icon: "🏢" },
                    { label: "Contrats actifs", value: totalLeases, accent: "bg-green-500", icon: "📋" },
                    { label: "Sécurisé (CDC)", value: `${totalSecuredFunds.toLocaleString()} FCFA`, accent: "bg-blue-600", icon: "🛡️" },
                    { label: "Performance / Mois", value: receiptsThisMonth, accent: "bg-purple-600", icon: "⚡" },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        variants={item}
                        className="glass-card p-8 rounded-[2rem] flex flex-col justify-between min-h-[200px]"
                    >
                        <div className="flex justify-between items-start">
                            <span className="label-tech text-[9px]">{stat.label}</span>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-white">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-8 flex items-end justify-between">
                            <dd className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</dd>
                            <div className={`h-2.5 w-2.5 rounded-full ${stat.accent} shadow-lg ring-4 ring-white`}></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Visual Action Panel */}
                <motion.section variants={item} className="lg:col-span-1 glass-card p-10 rounded-[2.5rem] bg-gray-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600 blur-[120px] opacity-20 -mr-40 -mt-40 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <h2 className="text-3xl font-black mb-10 leading-none">Commandes<br/>Rapides.</h2>
                        <div className="space-y-4 mt-auto">
                            <Link href="/dashboard/properties" className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group/link border border-white/5 hover:border-white/20">
                                <span className="font-bold tracking-tight text-sm uppercase">Nouveau Logement</span>
                                <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                            <Link href="/dashboard/leases" className="flex items-center justify-between p-6 bg-orange-500 hover:bg-orange-600 rounded-2xl transition-all group/link shadow-xl shadow-orange-950/20">
                                <span className="font-bold tracking-tight text-sm uppercase">Générer Quittance</span>
                                <svg className="w-5 h-5 group-hover/link:translate-y-[-2px] group-hover/link:translate-x-[2px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* Modern List View */}
                <motion.section variants={item} className="lg:col-span-2 glass-panel p-10 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Patrimoine Actif.</h3>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Dernières mises à jour</span>
                        </div>
                        <Link href="/dashboard/properties" className="label-tech py-2 px-4 bg-gray-50 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all border border-gray-100">Explorer</Link>
                    </div>
                    <div className="space-y-4">
                        {properties.slice(0, 4).map((prop) => (
                            <div key={prop.id} className="flex items-center justify-between p-5 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-50 group hover:shadow-xl hover:shadow-gray-100/50">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-2xl text-xl shadow-inner border border-white group-hover:bg-orange-50 transition-colors">🏢</div>
                                    <div>
                                        <p className="font-extrabold text-gray-900 leading-none mb-2 text-lg">{prop.name || prop.address}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{prop.city} — {prop.neighborhood}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-8">
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-black text-gray-900">{(prop.leases?.length || 0)} UNITÉS</p>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-green-500 w-full opacity-80"></div>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </motion.div>
    )
}
