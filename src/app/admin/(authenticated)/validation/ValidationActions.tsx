"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { approveDocument, rejectDocument } from "@/actions/admin-actions"

interface ValidationActionsProps {
    docId: string
    currentStatus: string
    hasFile?: boolean
}

export default function ValidationActions({ docId, currentStatus, hasFile = true }: ValidationActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [rejectionMode, setRejectionMode] = useState(false)
    const [reason, setReason] = useState("")
    const router = useRouter()

    const handleApprove = () => {
        if (!hasFile) {
            alert("Impossible d'approuver : aucun fichier n'a été envoyé par l'utilisateur.")
            return
        }
        if (!confirm("Confirmez-vous avoir vérifié visuellement la pièce d'identité et souhaitez-vous valider ce compte ?")) return
        startTransition(async () => {
            const res = await approveDocument(docId)
            if (res?.success) {
                router.refresh()
            } else {
                alert(res?.error || "Une erreur inconnue s'est produite lors de l'approbation.")
            }
        })
    }

    const handleReject = () => {
        if (!reason) return alert("Veuillez saisir un motif de rejet.")
        startTransition(async () => {
            const res = await rejectDocument(docId, reason)
            if (res?.success) {
                router.refresh()
            } else {
                alert(res?.error || "Une erreur inconnue s'est produite lors du rejet.")
            }
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
        <div className="space-y-4">
            {!hasFile && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs font-bold text-amber-800">
                    <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                    <span>Aucun fichier joint — l&apos;approbation est désactivée.</span>
                </div>
            )}

            {!rejectionMode ? (
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={isPending || !hasFile}
                        className="w-full px-6 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        Valider la pièce &amp; le compte
                    </button>
                    <button
                        onClick={() => setRejectionMode(true)}
                        disabled={isPending}
                        className="w-full px-6 py-3.5 bg-red-50 text-red-600 border border-red-100 font-black rounded-2xl hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        <XCircle size={18} />
                        Rejeter la pièce
                    </button>
                </div>
            ) : (
                <div className="space-y-4 p-5 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-4 duration-300">
                    <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Motif du rejet</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Document flou ou expiré..."
                        className="w-full h-24 p-3.5 bg-white rounded-xl border border-red-200 focus:ring-2 focus:ring-red-400 text-sm font-medium outline-none"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={handleReject}
                            disabled={isPending || !reason}
                            className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] disabled:opacity-50"
                        >
                            {isPending ? "Envoi..." : "Confirmer le Rejet"}
                        </button>
                        <button
                            onClick={() => setRejectionMode(false)}
                            className="px-4 py-3 bg-white text-gray-500 font-black rounded-xl uppercase tracking-widest text-[10px]"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
