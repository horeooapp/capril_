"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface NewsItem {
    id: string
    content: string
}

interface NewsTickerProps {
    items: NewsItem[]
}

export default function NewsTicker({ items }: NewsTickerProps) {
    if (!items || items.length === 0) return null

    // Duplicate items to ensure smooth infinite loop
    const duplicatedItems = [...items, ...items, ...items]

    return (
        <div className="relative w-full overflow-hidden bg-gray-900 border-b border-white/5 py-2.5 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                {/* Fixed Label */}
                <div className="flex-shrink-0 flex items-center bg-primary px-3 py-1 rounded-lg mr-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">QAPRIL News</span>
                    <span className="flex h-2 w-2 ml-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                </div>

                {/* News Content */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="flex whitespace-nowrap animate-ticker translate-z-0">
                        {duplicatedItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="inline-flex items-center px-8 border-r border-white/10 last:border-0">
                                <span className="text-white/40 mr-3">✦</span>
                                <span className="text-[11px] font-bold text-gray-200 uppercase tracking-widest">{item.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Gradients for Smooth In/Out */}
            <div className="absolute inset-y-0 left-[180px] w-20 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none z-10 hidden md:block"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-10 hidden md:block"></div>
        </div>
    )
}
