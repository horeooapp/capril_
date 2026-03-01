import React from 'react'

interface ReliabilityBadgeProps {
    score: number
    showLabel?: boolean
}

export const ReliabilityBadge = ({ score, showLabel = true }: ReliabilityBadgeProps) => {
    // Determine color and status based on score
    let colorClass = 'bg-gray-100 text-gray-800'
    let label = 'Nouveau'
    let icon = '⚪'

    if (score >= 90) {
        colorClass = 'bg-green-100 text-green-800 border-green-200'
        label = 'Excellent'
        icon = '💎'
    } else if (score >= 75) {
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
        label = 'Très Bon'
        icon = '⭐'
    } else if (score >= 50) {
        colorClass = 'bg-orange-100 text-orange-800 border-orange-200'
        label = 'Correct'
        icon = '✅'
    } else {
        colorClass = 'bg-red-100 text-red-800 border-red-200'
        label = 'À surveiller'
        icon = '⚠️'
    }

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorClass} transition-all hover:scale-105 cursor-help shadow-sm`}>
            <span className="mr-1.5">{icon}</span>
            {showLabel && <span className="mr-1">{label} :</span>}
            <span>{score.toFixed(1)}%</span>
        </div>
    )
}
