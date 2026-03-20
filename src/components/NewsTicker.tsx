"use client"

import React from 'react'

interface NewsItem {
    id: string
    content: string
}

interface NewsTickerProps {
    items: NewsItem[]
    duration?: number
}

export default function NewsTicker({ items, duration = 40 }: NewsTickerProps) {
    if (!items || items.length === 0) return null

    // Duplicate items to ensure smooth infinite loop
    const duplicatedItems = [...items, ...items, ...items]

    return (
        <div className="relative w-full overflow-hidden bg-gray-950/40 backdrop-blur-xl border-t border-white/10 py-3 z-[60] shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                {/* Fixed Label - Premium Badge */}
                <div className="flex-shrink-0 flex items-center bg-white/5 backdrop-blur-2xl px-4 py-2 rounded-xl mr-8 border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic relative z-10">
                        QAPRIL <span className="text-primary glow-primary">Market</span>
                    </span>
                    <span className="flex h-2 w-2 ml-4">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_rgba(255,130,0,0.8)]"></span>
                    </span>
                </div>

                {/* News Content */}
                <div className="flex-1 overflow-hidden relative">
                    <div 
                        className="flex whitespace-nowrap animate-ticker translate-z-0"
                        style={{ animationDuration: `${duration}s` }}
                    >
                        {duplicatedItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="inline-flex items-center px-10 border-r border-white/5 last:border-0">
                                <span className="text-primary/60 text-lg mr-4 drop-shadow-[0_0_8px_rgba(255,130,0,0.4)]">✦</span>
                                <span className="text-[12px] font-bold text-gray-100 uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-default">
                                    {item.content}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Gradients for Smooth In/Out */}
            <div className="absolute inset-y-0 left-[200px] w-32 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent pointer-events-none z-10 hidden md:block"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-950 via-gray-950/80 to-transparent pointer-events-none z-10 hidden md:block"></div>
        </div>
    )
}
