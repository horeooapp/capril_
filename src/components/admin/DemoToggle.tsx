"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { toggleDemoMode } from "@/actions/demo-actions"
import { Shield, Database, Sparkles, Loader2 } from "lucide-react"

interface DemoToggleProps {
    initialEnabled: boolean
}

export default function DemoToggle({ initialEnabled }: DemoToggleProps) {
    const [isEnabled, setIsEnabled] = useState(initialEnabled)
    const [isPending, startTransition] = useTransition()

    const handleToggle = async () => {
        const nextState = !isEnabled
        setIsEnabled(nextState) // Optimistic update
        
        startTransition(async () => {
            const result = await toggleDemoMode(nextState)
            if (!result.success) {
                setIsEnabled(isEnabled) // Rollback
                alert(result.error)
            }
        })
    }

    return (
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm border border-gray-200 p-2 pl-4 rounded-2xl shadow-sm">
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Environnement</span>
                <span className={`text-[11px] font-bold uppercase tracking-tight flex items-center gap-1 ${isEnabled ? 'text-orange-600' : 'text-green-600'}`}>
                    {isEnabled ? (
                        <>
                            <Sparkles size={12} /> Mode Démo
                        </>
                    ) : (
                        <>
                            <Shield size={12} /> Production
                        </>
                    )}
                </span>
            </div>

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`
                    relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center p-1
                    ${isEnabled ? 'bg-orange-500 shadow-orange-200 shadow-lg' : 'bg-gray-200'}
                    ${isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <motion.div
                    animate={{ x: isEnabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin" size={12} />
                    ) : isEnabled ? (
                        <Sparkles size={12} className="text-orange-500" />
                    ) : (
                        <Database size={12} className="text-gray-400" />
                    )}
                </motion.div>
            </button>
        </div>
    )
}
