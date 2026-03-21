"use client"

import { useState } from "react"
import { triggerFiscalReminders } from "@/actions/fiscal-reminders"
import { BellRing, Loader2, CheckCircle2 } from "lucide-react"

export default function FiscalReminderButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ sentCount?: number; error?: string } | null>(null)

    const handleTrigger = async () => {
        setLoading(true)
        setResult(null)
        try {
            const res = await triggerFiscalReminders()
            if (res.success) {
                setResult({ sentCount: res.sentCount })
            } else {
                setResult({ error: res.error })
            }
        } catch (err) {
            setResult({ error: "Erreur serveur" })
        } finally {
            setLoading(false)
            // Reset result after 5 seconds
            setTimeout(() => setResult(null), 5000)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleTrigger}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 ${
                    loading 
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                }`}
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    <>
                        <BellRing size={16} />
                        Lancer les relances (M17)
                    </>
                )}
            </button>
            
            {result?.sentCount !== undefined && (
                <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 size={12} />
                    {result.sentCount} notifications envoyées
                </div>
            )}

            {result?.error && (
                <div className="text-red-400 text-[10px] font-black uppercase tracking-widest animate-in shake">
                    {result.error}
                </div>
            )}
        </div>
    )
}
