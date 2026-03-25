"use client"

import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import { ShieldCheck, FileCheck, Users, Banknote } from "lucide-react"

function Counter({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 })
    const display = useTransform(spring, (latest) => 
        Math.floor(latest).toLocaleString() + (isCurrency ? " FCFA" : "")
    )

    useEffect(() => {
        if (inView) {
            spring.set(value)
        }
    }, [inView, value, spring])

    return <motion.span ref={ref}>{display}</motion.span>
}

interface ImpactStatsProps {
    stats: {
        totalLeases: number
        totalSecuredFunds: number
        totalFiscal: number
        totalUsers: number
    }
}

export default function ImpactStats({ stats }: ImpactStatsProps) {
    const cards = [
        {
            label: "Patrimoine Sécurisé (CDC)",
            value: stats.totalSecuredFunds,
            unit: "FCFA",
            icon: ShieldCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
            isCurrency: true
        },
        {
            label: "Transactions Certifiées",
            value: stats.totalLeases,
            unit: "Unités",
            icon: FileCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            isCurrency: false
        },
        {
            label: "Inclusion Digitale",
            value: stats.totalUsers,
            unit: "Utilisateurs",
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            isCurrency: false
        },
        {
            label: "Recettes Fiscales (DGI)",
            value: stats.totalFiscal,
            unit: "FCFA",
            icon: Banknote,
            color: "text-amber-600",
            bg: "bg-amber-50",
            isCurrency: true
        }
    ]

    return (
        <div className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Performance Nationale</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                        L&apos;Impact <span className="text-primary italic">Réel</span> de QAPRIL.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:scale-[1.02] transition-transform"
                        >
                            <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                                <card.icon size={28} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
                                <div className="text-3xl font-black text-gray-900 tracking-tighter">
                                    <Counter value={card.value} isCurrency={card.isCurrency} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
