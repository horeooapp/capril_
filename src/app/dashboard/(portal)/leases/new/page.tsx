"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"

import { createLease } from "@/actions/leases"
import { createBDQ } from "@/actions/bdq"
import { getProperties } from "@/actions/properties"

// Define TypeBail locally to avoid @prisma/client bundling issues in Client Components
enum TypeBail {
    ECRIT = "ECRIT",
    DECLARATIF_BDQ = "DECLARATIF_BDQ"
}

export default function LeaseRegistrationPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [properties, setProperties] = useState<any[]>([])
    const [step, setStep] = useState(1)
    const [typeBail, setTypeBail] = useState<TypeBail>(TypeBail.ECRIT)

    useEffect(() => {
        getProperties().then(setProperties).catch(console.error)
    }, [])

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    {typeBail === TypeBail.DECLARATIF_BDQ ? "Déclaration Bail Verbal (BDQ)" : "Nouveau Bail Normalisé"}
                </h1>
                <p className="text-gray-500 text-lg">ADD-05 Compliance — Étape {step} sur 3 (Restoration partielle)</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <p>Si vous voyez ce message, les Server Actions ont été importées sans crash.</p>
                <p className="mt-2 text-sm text-green-600 font-bold">
                    Propriétés chargées : {properties.length}
                </p>
                <button 
                   onClick={() => setStep(step + 1)}
                   className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl"
                >
                   Étape suivante ({step})
                </button>
            </div>
        </div>
    )
}
