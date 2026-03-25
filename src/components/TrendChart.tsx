"use client"

import { motion } from "framer-motion"

interface DataPoint {
    label: string
    value: number
}

interface TrendChartProps {
    data: DataPoint[]
    color?: string
    height?: number
    title: string
    unit: string
}

export default function TrendChart({ data, color = "#C55A11", height = 200, title, unit }: TrendChartProps) {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = 400
    
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2
    const minValue = Math.min(...data.map(d => d.value)) * 0.8
    
    const getY = (value: number) => height - margin.bottom - ((value - minValue) / (maxValue - minValue)) * (height - margin.top - margin.bottom)
    const getX = (index: number) => margin.left + (index / (data.length - 1)) * (width - margin.left - margin.right)

    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ")
    const areaPoints = `${getX(0)},${height - margin.bottom} ` + points + ` ${getX(data.length - 1)},${height - margin.bottom}`

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col h-full group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">{title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Indice QAPRIL Observatoire</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-gray-900 leading-none">{data[data.length - 1].value.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-primary uppercase">{unit}</span>
                </div>
            </div>

            <div className="relative flex-1 min-h-[150px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                    <defs>
                        <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.5, 1].map((p, i) => {
                        const y = getY(minValue + p * (maxValue - minValue))
                        return (
                            <line 
                                key={i}
                                x1={margin.left} 
                                y1={y} 
                                x2={width - margin.right} 
                                y2={y} 
                                stroke="#f3f4f6" 
                                strokeWidth="1" 
                                strokeDasharray="4 4"
                            />
                        )
                    })}

                    {/* Area fill */}
                    <motion.polyline
                        points={areaPoints}
                        fill={`url(#gradient-${title})`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Line */}
                    <motion.polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />

                    {/* Points */}
                    {data.map((d, i) => (
                        <motion.circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.value)}
                            r="4"
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        />
                    ))}
                </svg>
            </div>

            <div className="mt-6 flex justify-between px-2">
                {data.filter((_, i) => i % 3 === 0).map((d, i) => (
                    <span key={i} className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{d.label}</span>
                ))}
            </div>
        </div>
    )
}
