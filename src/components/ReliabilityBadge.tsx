import React from 'react'
import { Award, Star, CheckCircle2, AlertTriangle, Minus } from 'lucide-react'

interface ReliabilityBadgeProps {
    score: number
    showLabel?: boolean
}

export const ReliabilityBadge = ({ score, showLabel = true }: ReliabilityBadgeProps) => {
    let conf = { color: 'text-gray-400 bg-gray-50', label: 'Nouveau', icon: Minus, glow: 'shadow-gray-100/50' }

    if (score >= 90) conf = { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: 'Elite', icon: Award, glow: 'shadow-emerald-200/50' }
    else if (score >= 75) conf = { color: 'text-blue-600 bg-blue-50 border-blue-100', label: 'Très Bon', icon: Star, glow: 'shadow-blue-200/50' }
    else if (score >= 50) conf = { color: 'text-orange-600 bg-orange-50 border-orange-100', label: 'Correct', icon: CheckCircle2, glow: 'shadow-orange-200/50' }
    else conf = { color: 'text-red-600 bg-red-50 border-red-100', label: 'À surveiller', icon: AlertTriangle, glow: 'shadow-red-200/50' }

    const Icon = conf.icon
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${conf.color} shadow-xl ${conf.glow} transition-all hover:scale-105 cursor-help group`}>
            <div className="flex items-center justify-center p-1 bg-white/60 rounded-lg shadow-inner">
                <Icon size={14} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
                {showLabel && <span className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">{conf.label}</span>}
                <span className="text-xs font-black tracking-tighter leading-none">{score.toFixed(1)}%</span>
            </div>
        </div>
    )
}
