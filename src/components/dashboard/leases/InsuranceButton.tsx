"use client"

import { toast } from "sonner"
import { useTransition } from "react"
import { generateInsuranceContract } from "@/actions/insurance-actions"

export function InsuranceButton({ leaseId }: { leaseId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleActivate = () => {
        startTransition(async () => {
            const promise = generateInsuranceContract(leaseId)
            toast.promise(promise, {
                loading: "Génération du contrat d'assurance et de la police...",
                success: "Protection activée et rattachée avec succès.",
                error: "Échec de l'activation."
            })
        })
    }

    return (
        <button 
            disabled={isPending}
            onClick={handleActivate} 
            className="mt-4 w-full bg-white hover:bg-qgrey-1 text-qnavy text-[10px] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
        >
            {isPending ? "Traitement..." : "Activer Protection"}
        </button>
    )
}
