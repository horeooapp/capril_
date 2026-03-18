"use client"

import { useState } from "react"
import { MandateStatus } from "@prisma/client"
import { validateMandate } from "@/actions/mandates"
import { useRouter } from "next/navigation"

interface MandateActionsProps {
    mandateId: string
    currentStatus: MandateStatus
}

export default function MandateActions({ mandateId, currentStatus }: MandateActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAction = async (newStatus: MandateStatus) => {
        const actionLabel = newStatus === MandateStatus.ACTIVE ? "valider" : "rejeter"
        if (!confirm(`Êtes-vous sûr de vouloir ${actionLabel} ce mandat ?`)) return

        setLoading(true)
        try {
            await validateMandate(mandateId, newStatus)
            router.refresh()
        } catch (_error) {
            alert("Une erreur est survenue lors de la validation du mandat.")
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus !== MandateStatus.DRAFT) {
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                currentStatus === MandateStatus.ACTIVE ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
                {currentStatus}
            </span>
        )
    }

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => handleAction(MandateStatus.ACTIVE)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {loading ? "Chargement..." : "Valider"}
            </button>
            <button
                onClick={() => handleAction(MandateStatus.CANCELLED)}
                disabled={loading}
                className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
                Rejeter
            </button>
        </div>
    )
}
