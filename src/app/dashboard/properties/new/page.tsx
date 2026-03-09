"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { registerProperty } from "@/actions/properties"

export default function NewPropertyPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [category, setCategory] = useState<'RESIDENTIAL' | 'COMMERCIAL'>('RESIDENTIAL')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        const data = {
            category,
            addressLine1: formData.get("addressLine1") as string,
            commune: formData.get("commune") as string,
            declaredRentFcfa: parseInt(formData.get("rent") as string),
            propertyType: formData.get("propertyType") as string,
            totalRooms: parseInt(formData.get("rooms") as string) || undefined,
            usefulAreaSqm: parseFloat(formData.get("area") as string) || undefined,
        }

        startTransition(async () => {
            const result = await registerProperty(data)
            if (result.error) {
                setError(result.error)
            } else {
                router.push("/dashboard/properties")
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enregistrer un bien</h1>
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                    Annuler
                </button>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => setCategory('RESIDENTIAL')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${category === 'RESIDENTIAL' ? 'bg-[#FF8200] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Résidentiel (HAB)
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategory('COMMERCIAL')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${category === 'COMMERCIAL' ? 'bg-[#FF8200] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Commercial (COM)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Adresse complète</label>
                                <input required name="addressLine1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" placeholder="Ex: Rue des Jardins, Immeuble Horizon" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Commune</label>
                                <input required name="commune" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" placeholder="Ex: Cocody" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Loyer déclaré (FCFA / mois)</label>
                                <input required type="number" name="rent" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" placeholder="Ex: 250000" />
                            </div>

                            {category === 'RESIDENTIAL' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type de bien</label>
                                        <select name="propertyType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none">
                                            <option value="APARTMENT">Appartement</option>
                                            <option value="VILLA">Villa</option>
                                            <option value="STUDIO">Studio</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre de pièces</label>
                                        <input type="number" name="rooms" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" placeholder="Ex: 3" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Surface utile (m²)</label>
                                        <input type="number" name="area" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" placeholder="Ex: 85" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Places de parking</label>
                                        <input type="number" name="parking" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white transition-all outline-none" defaultValue={0} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 px-6 bg-[#FF8200] hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 transition-all transform hover:-translate-y-1"
                            >
                                {isPending ? "Traitement..." : "Générer le code et enregistrer"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
