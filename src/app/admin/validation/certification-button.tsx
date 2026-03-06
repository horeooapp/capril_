"use client"

import { useState, useTransition } from "react"
import { certifyAgency } from "@/actions/admin-actions"

export default function CertificationButton({ userId }: { userId: string }) {
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)

    const handleCertify = () => {
        if (!confirm("Voulez-vous vraiment certifier cette agence ? Elle pourra alors gérer des baux et des mandats officiellement.")) {
            return
        }

        startTransition(async () => {
            const result = await certifyAgency(userId)
            if (result.success) {
                setSuccess(true)
            } else {
                alert(result.error)
            }
        })
    }

    if (success) {
        return (
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 shadow-sm">
                Certifié avec succès
            </span>
        )
    }

    return (
        <button
            onClick={handleCertify}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
        >
            {isPending ? "Traitement..." : "Certifier l'agence"}
        </button>
    )
}
