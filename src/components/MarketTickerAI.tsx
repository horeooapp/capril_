import React from 'react'
import { getMarketAIInsights } from '@/actions/market-ai'
import NewsTicker from './NewsTicker'

export default async function MarketTickerAI() {
    const marketItems = await getMarketAIInsights()
    
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-red-600">
            <NewsTicker items={marketItems} duration={60} />
            <div className="absolute top-0 right-0 bg-white text-black text-[10px] p-1">DEBUG: TICKER ACTIVE</div>
        </div>
    )
}
