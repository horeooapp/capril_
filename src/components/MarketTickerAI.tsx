import React from 'react'
import { getMarketAIInsights } from '@/actions/market-ai'
import NewsTicker from './NewsTicker'

export default async function MarketTickerAI() {
    const marketItems = await getMarketAIInsights()

    return (
        <div className="fixed bottom-20 xl:bottom-0 left-0 right-0 z-[100]">
            <NewsTicker items={marketItems} />
            {/* Additional styling to make it feel like it's at the bottom */}
            <style jsx global>{`
                .animate-ticker {
                    animation-duration: 60s !important; /* Slower for premium feel */
                }
            `}</style>
        </div>
    )
}
