/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createLease } from "@/actions/leases"
import { getProperties } from "@/actions/properties"

export default function LeaseRegistrationPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [rentAmount, setRentAmount] = useState<number>(0)

    useEffect(() => {
        getProperties().then(setProperties).catch(console.error)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        const deposit = parseInt(formData.get("deposit") as string || "0")
        const advance = parseInt(formData.get("advance") as string || "0")
        const agency = parseInt(formData.get("agency") as string || "0")
        
        // v2.0 Financial Ceilings (Part 7.1)
        if (deposit > rentAmount * 2) return setError("La caution ne peut excéder 2 mois de loyer.")
        if (advance > rentAmount * 2) return setError("L'avance ne peut excéder 2 mois.")
        if (agency > rentAmount) return setError("Les frais d'agence ne peuvent excéder 1 mois.")

        const data = {
            propertyId: formData.get("propertyId") as string,
            leaseType: 'residential' as const,
            tenantPhone: formData.get("tenantPhone") as string,
            startDate: new Date(formData.get("startDate") as string),
            rentAmount: rentAmount,
            durationMonths: 12, // Default duration
            chargesAmount: parseInt(formData.get("charges") as string || "0"),
            depositAmount: deposit,
        }

        startTransition(async () => {
            const result = await createLease(data)
            if (result.error) {
                setError(result.error)
            } else {
                router.push("/dashboard/leases")
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Créer un Bail Normalisé</h1>
                <p className="text-gray-500 text-lg">Générez un contrat conforme à la règlementation v2.0</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium animate-shake">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-8">
                        {/* Section 1: Property & Tenant */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Choisir un bien</label>
                                <select required name="propertyId" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Sélectionnez une propriété</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.propertyCode} - {p.addressLine1} ({p.commune})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Téléphone du Locataire</label>
                                <input required type="tel" name="tenantPhone" placeholder="+225 00 00 00 00" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" />
                            </div>
                        </div>

                        {/* Section 2: Financials */}
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Conditions Financières</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-600">Loyer mensuel (FCFA)</label>
                                    <input required type="number" value={rentAmount || ''} onChange={(e) => setRentAmount(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all text-xl font-black text-blue-600" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600">Charges (FCFA)</label>
                                    <input type="number" name="charges" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" placeholder="0" />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600">Caution (Max 2 mois)</label>
                                    <input type="number" name="deposit" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" placeholder={rentAmount ? (rentAmount * 2).toString() : "0"} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600">Avance (Max 2 mois)</label>
                                    <input type="number" name="advance" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" placeholder={rentAmount ? (rentAmount * 2).toString() : "0"} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600">Frais d&apos;agence (Max 1 mois)</label>
                                    <input type="number" name="agency" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" placeholder={rentAmount ? rentAmount.toString() : "0"} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                             <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date de début</label>
                                <input required type="date" name="startDate" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                        <button type="button" onClick={() => router.back()} className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Annuler</button>
                        <button 
                            type="submit" 
                            disabled={isPending} 
                            className="px-12 py-4 bg-[#FF8200] hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 disabled:opacity-50 transition-all transform hover:-translate-y-1"
                        >
                            {isPending ? "Génération du bail..." : "Créer le Contrat Digital"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
