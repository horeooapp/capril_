"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface LiveActivityStreamProps {
    logs: any[]
}

export default function LiveActivityStream({ logs: initialLogs = [] }: LiveActivityStreamProps) {
    const [logs, setLogs] = useState(initialLogs)
    const [isPolling, setIsPolling] = useState(false)

    const fetchLogs = useCallback(async () => {
        try {
            setIsPolling(true)
            const res = await fetch('/api/admin/audit-logs')
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (error) {
            console.error("Failed to fetch logs", error)
        } finally {
            setIsPolling(false)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(fetchLogs, 15000) // Poll every 15s
        return () => clearInterval(interval)
    }, [fetchLogs])

    return (
        <div className="bg-gray-950 rounded-3xl border border-gray-800 overflow-hidden h-[400px] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className={`${isPolling ? 'text-yellow-400' : 'text-yellow-600'} transition-colors animate-pulse`} size={16} />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Event Stream</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-black animate-pulse uppercase">
                        Direct
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                            className="text-[11px] flex gap-2 group"
                        >
                            <span className="text-gray-600 whitespace-nowrap">
                                [{new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour12: false })}]
                            </span>
                            <span className={`font-bold whitespace-nowrap ${
                                log.module === 'MANDATE' ? 'text-blue-400' :
                                log.module === 'COLOC' ? 'text-emerald-400' :
                                log.module === 'TERRAIN' ? 'text-amber-400' :
                                'text-indigo-400'
                            }`}>
                                {log.module}
                            </span>
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                {(log.action || "").replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-600 italic truncate">
                                by {log.user?.fullName || "System"}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 italic text-xs">
                        Wait for events...
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-900/20 border-t border-gray-800 text-[9px] text-gray-500 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Polling (15s)
                </div>
                <div>SECURE_TUNNEL_08</div>
            </div>
        </div>
    )
}
