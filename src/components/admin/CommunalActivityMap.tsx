"use client"

import { motion } from "framer-motion"

interface CommunalActivityMapProps {
    activeCommunes: { name: string; activityLevel: number; x: number; y: number }[]
}

const COMMUNES = [
    { name: "Cocody", x: 65, y: 45 },
    { name: "Plateau", x: 55, y: 55 },
    { name: "Yopougon", x: 30, y: 50 },
    { name: "Abobo", x: 50, y: 25 },
    { name: "Marcory", x: 60, y: 70 },
    { name: "Treichville", x: 52, y: 65 },
    { name: "Koumassi", x: 75, y: 75 },
    { name: "Bingerville", x: 90, y: 40 },
]

export default function CommunalActivityMap({ activeCommunes = [] }: CommunalActivityMapProps) {
    return (
        <div className="relative w-full aspect-square bg-gray-950 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* Abstract Grid / Map Background */}
            <div className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: "radial-gradient(circle at 2px 2px, #374151 1px, transparent 0)", 
                    backgroundSize: "32px 32px" 
                }} 
            />
            
            {/* Côte d'Ivoire / Abidjan Abstract Shape (Very simplified) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-8">
                <path 
                    d="M20,40 Q30,20 50,20 T80,40 T70,80 T30,70 Z" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="0.1" 
                    strokeDasharray="1 2"
                    className="opacity-10"
                />
                
                {COMMUNES.map((commune) => {
                    const isActive = activeCommunes.some(ac => ac.name === commune.name)
                    return (
                        <g key={commune.name}>
                            {/* Static Point */}
                            <circle 
                                cx={commune.x} 
                                cy={commune.y} 
                                r="0.8" 
                                className={isActive ? "fill-indigo-500" : "fill-gray-700"} 
                            />
                            
                            {/* Label */}
                            <text 
                                x={commune.x + 2} 
                                y={commune.y + 0.5} 
                                className="text-[2px] fill-gray-500 font-bold"
                            >
                                {commune.name}
                            </text>

                            {/* Pulsing Aura if active */}
                            {isActive && (
                                <>
                                    <motion.circle
                                        cx={commune.x}
                                        cy={commune.y}
                                        r="3"
                                        initial={{ scale: 0.5, opacity: 0.8 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                        className="fill-indigo-500/30"
                                    />
                                    <motion.circle
                                        cx={commune.x}
                                        cy={commune.y}
                                        r="1.5"
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 0.4 }}
                                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                        className="fill-indigo-400"
                                    />
                                </>
                            )}
                        </g>
                    )
                })}
            </svg>

            {/* Legend / Overlay */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Activité Live</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[8px] text-gray-600">
                    GPS: ABJ_GRID_V3
                </div>
            </div>
        </div>
    )
}
