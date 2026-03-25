"use client"

import { motion } from "framer-motion"

interface BarData {
    label: string
    value: number
}

interface BarChartProps {
    data: BarData[]
    title: string
    unit: string
    color?: string
}

export default function BarChart({ data, title, unit, color = "#1F4E79" }: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value))
    
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col group hover:scale-[1.02] transition-transform">
            <div className="mb-8">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">{title}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Analyse Géographique QAPRIL</span>
            </div>

            <div className="space-y-4">
                {data.map((d, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{d.label}</span>
                            <span className="text-[10px] font-black text-gray-900">{d.value.toLocaleString()} {unit}</span>
                        </div>
                        <div className="h-3 bg-gray-50 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(d.value / maxValue) * 100}%` }}
                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                className="h-full rounded-full relative overflow-hidden"
                                style={{ backgroundColor: color }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
