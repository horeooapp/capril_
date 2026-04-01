"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { upsertAgencyProfile } from "@/actions/agency-profile"
import { Building2, Save } from "lucide-react"

export default function RequireAgencyProfile() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)
        const data = {
            nomAgence: formData.get("nomAgence") as string,
            rccm: formData.get("rccm") as string,
            dfe: formData.get("dfe") as string,
            numEnregistrement: (formData.get("numEnregistrement") as string) || undefined,
            adresseLocal: (formData.get("adresseLocal") as string) || undefined,
        }

        startTransition(async () => {
            const result = await upsertAgencyProfile(data)
            if (result.error) {
                setError(result.error)
            } else {
                // If success, refresh the page to dismiss the barrier
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex flex-col items-center justify-center text-[#FF8200] mb-2 shadow-sm">
                    <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-qnavy tracking-tight">Oups ! Profil Agence Requis</h1>
                <p className="text-qgrey-400 font-medium max-w-lg">
                    Vous êtes connecté en tant qu'Agence. Avant d'enregistrer votre premier bien ou de commencer à l'exploiter, vous devez obligatoirement remplir les informations légales de votre agence.
                </p>
            </div>

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                <div className="p-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">Nom complet de l'agence</label>
                                <input required name="nomAgence" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FF8200]/20 focus:ring-4 focus:ring-[#FF8200]/10 focus:bg-white font-semibold transition-all outline-none" placeholder="Ex: Horizon Immobilier SARL" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">RCCM (Obligatoire)</label>
                                    <input required name="rccm" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FF8200]/20 focus:ring-4 focus:ring-[#FF8200]/10 focus:bg-white font-medium transition-all outline-none" placeholder="CI-ABJ-03-..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">Numéro DFE (Obligatoire)</label>
                                    <input required name="dfe" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FF8200]/20 focus:ring-4 focus:ring-[#FF8200]/10 focus:bg-white font-medium transition-all outline-none" placeholder="Ex: 1234567 A" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">N° d'enregistrement (Agence certifiée)</label>
                                <input name="numEnregistrement" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FF8200]/20 focus:ring-4 focus:ring-[#FF8200]/10 focus:bg-white font-medium transition-all outline-none" placeholder="Optionnel si en cours d'enregistrement" />
                                <p className="text-[10px] text-gray-400 mt-2 px-1">Laissez vide si vous n'avez pas encore d'agrément certifié.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 px-1">Adresse physique des locaux</label>
                                <input name="adresseLocal" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FF8200]/20 focus:ring-4 focus:ring-[#FF8200]/10 focus:bg-white font-medium transition-all outline-none" placeholder="Optionnel. Ex: Abidjan, Cocody 2 Plateaux..." />
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#FF8200] hover:bg-orange-600 active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 transition-all"
                            >
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {isPending ? "Certifications en cours..." : "Enregistrer mon profil Agence"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
