"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { approveDocument, rejectDocument } from "@/actions/admin-actions"

interface ValidationActionsProps {
    docId: string
    currentStatus: string
}

export default function ValidationActions({ docId, currentStatus }: ValidationActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [rejectionMode, setRejectionMode] = useState(false)
    const [reason, setReason] = useState("")
    const router = useRouter()

    const handleApprove = () => {
        if (!confirm("Approuver ce document d'identité ?")) return
        startTransition(async () => {
            const res = await approveDocument(docId)
            if (res.success) router.refresh()
            else alert(res.error)
        })
    }

    const handleReject = () => {
        if (!reason) return alert("Veuillez saisir un motif de rejet.")
        startTransition(async () => {
            const res = await rejectDocument(docId, reason)
            if (res.success) router.refresh()
            else alert(res.error)
        })
    }

    if (currentStatus === "verified") {
        return (
            <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-sm bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={24} />
                Document Vérifié
            </div>
        )
    }

    if (currentStatus === "rejected") {
        return (
            <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-sm bg-red-50 px-6 py-4 rounded-2xl border border-red-100">
                <XCircle size={24} />
                Document Rejeté
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!rejectionMode ? (
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="flex-1 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                        Approuver Document
                    </button>
                    <button
                        onClick={() => setRejectionMode(true)}
                        disabled={isPending}
                        className="flex-1 px-8 py-4 bg-red-50 text-red-600 border border-red-100 font-black rounded-2xl hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50"
                    >
                        <XCircle size={20} />
                        Rejeter
                    </button>
                </div>
            ) : (
                <div className="space-y-4 p-6 bg-red-50 rounded-[2rem] border border-red-100 animate-in slide-in-from-top-4 duration-300">
                    <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Motif du rejet</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Document flou ou expiré..."
                        className="w-full h-24 p-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-red-400 text-sm font-medium"
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleReject}
                            disabled={isPending || !reason}
                            className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] disabled:opacity-50"
                        >
                            {isPending ? "Envoi..." : "Confirmer le Rejet"}
                        </button>
                        <button
                            onClick={() => setRejectionMode(false)}
                            className="px-6 py-3 bg-white text-gray-400 font-black rounded-xl uppercase tracking-widest text-[10px]"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
