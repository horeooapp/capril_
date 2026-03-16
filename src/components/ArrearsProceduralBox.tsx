"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, ChevronRight, Gavel, Mail, MessageSquare, ShieldAlert } from "lucide-react"
import { initiateProceduralPhase } from "@/actions/arrears-actions"

interface ArrearsProceduralBoxProps {
    leaseId: string
    proceduralState: {
        active: boolean
        delayDays: number
        lastPhase: string | null
        unpaidCount: number
    }
}

const PHASE_ACTIONS: Record<string, { label: string; icon: any; next: string; description: string }> = {
    "AMIABLE": { 
        label: "Mise en demeure (Email/SMS)", 
        icon: Mail, 
        next: "PHASE_2_FORMAL",
        description: "Déclencher la mise en demeure officielle par voie électronique."
    },
    "PHASE_1_AMIABLE": { 
        label: "Mise en demeure (Email/SMS)", 
        icon: Mail, 
        next: "PHASE_2_FORMAL",
        description: "L'étape amiable a expiré. Passez à la mise en demeure officielle."
    },
    "PHASE_2_FORMAL": { 
        label: "Mise en demeure (MaPoste)", 
        icon: MessageSquare, 
        next: "PHASE_3_MAPOSTE",
        description: "Le locataire n'a pas réagi. Envoyez un courrier recommandé via MaPoste."
    },
    "PHASE_3_MAPOSTE": { 
        label: "Centre de Médiation", 
        icon: MessageSquare, 
        next: "PHASE_4_SUSPENSION", // Simplified for demo
        description: "Saisir le centre de médiation QAPRIL pour arbitrage."
    }
}

export default function ArrearsProceduralBox({ leaseId, proceduralState }: ArrearsProceduralBoxProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    if (!proceduralState.active) return null

    // Determine target phase based on delay and last phase
    let targetPhaseKey = "AMIABLE"
    if (proceduralState.lastPhase) {
        targetPhaseKey = proceduralState.lastPhase
    }

    const action = PHASE_ACTIONS[targetPhaseKey] || PHASE_ACTIONS["PHASE_3_MAPOSTE"]

    async function handleAction() {
        setLoading(true)
        setError(null)
        try {
            const res = await initiateProceduralPhase(leaseId, action.next)
            if (res.error) {
                setError(res.error)
            } else {
                setSuccess(true)
            }
        } catch (e) {
            setError("Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert size={80} className="text-red-500" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
                        <AlertTriangle size={20} />
                        <span>Impayé détecté ({proceduralState.delayDays} jours de retard)</span>
                    </div>
                    <h3 className="text-xl font-bold font-display text-white">
                        Action Recommandée : {action.label}
                    </h3>
                    <p className="text-gray-400 max-w-md">
                        {action.description}
                    </p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    {!success ? (
                        <>
                            <button
                                onClick={handleAction}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <action.icon size={20} />
                                        <span>Valider l'Action</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                        </>
                    ) : (
                        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm font-bold">
                            <ShieldAlert size={18} />
                            Action validée et transmise
                        </div>
                    )}
                    <button className="text-gray-500 hover:text-white text-sm transition-colors">
                        Ignorer (Clemence)
                    </button>
                </div>
            </div>

            {/* Progress Bar (Visual) */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <span className={proceduralState.active ? "text-red-500" : ""}>Amiable</span>
                <div className="h-px flex-1 bg-white/5 relative">
                    <div 
                        className="absolute h-full bg-red-500 transition-all" 
                        style={{ width: `${Math.min(proceduralState.delayDays / 120 * 100, 100)}%` }} 
                    />
                </div>
                <span>Expulsion</span>
            </div>
        </motion.div>
    )
}
