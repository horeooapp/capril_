"use client"

import React from "react"
import { motion } from "framer-motion"

interface AuditChartProps {
    logs: any[]
}

export default function AuditChart({ logs }: AuditChartProps) {
    // Process last 7 days of activity
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
    }).reverse()

    const data = days.map(day => {
        const count = logs.filter(l => l.createdAt.startsWith(day)).length
        return { day, count }
    })

    const maxCount = Math.max(...data.map(d => d.count), 1)

    return (
        <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Activité Système (7j)</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Volume d'audit consolidé</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ivoire-dark"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Événements</span>
                    </div>
                </div>
            </div>

            <div className="h-48 flex items-end gap-3 px-2">
                {data.map((d, i) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="relative w-full flex flex-col justify-end h-full">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.count / maxCount) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="w-full bg-ivoire-dark/80 group-hover:bg-ivoire-dark rounded-t-xl transition-colors relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-black py-1 px-2 rounded-lg">
                                    {d.count}
                                </div>
                            </motion.div>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 truncate w-full text-center uppercase tracking-tighter">
                            {new Date(d.day).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
