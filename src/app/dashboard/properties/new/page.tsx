"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProperty } from "@/actions/properties"

export default function NewPropertyPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const address = formData.get("address") as string
        const city = formData.get("city") as string
        const postalCode = formData.get("postalCode") as string

        try {
            await createProperty({
                name,
                address,
                city,
                postalCode,
                country: "CI" // Default to Côte d'Ivoire
            })
            router.push("/dashboard/properties")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'ajout.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Ajouter un logement</h1>
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                >
                    Retour
                </button>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du logement (Optionnel)</label>
                            <div className="mt-1">
                                <input type="text" name="name" id="name" placeholder="Ex: Rsidence Les Mimosas - Appt 12" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse complte *</label>
                            <div className="mt-1">
                                <input required type="text" name="address" id="address" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville / Commune *</label>
                                <div className="mt-1">
                                    <input required type="text" name="city" id="city" placeholder="Ex: Cocody" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code Postal (Optionnel)</label>
                                <div className="mt-1">
                                    <input type="text" name="postalCode" id="postalCode" className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-opacity-50 transition-colors"
                            >
                                {loading ? "Enregistrement en cours..." : "Enregistrer le logement"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
