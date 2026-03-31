"use client"

import React, { useState, useTransition } from "react"
import { updateUserProfile } from "@/actions/profile"
import { CheckCircle2, User, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

export const ProfileUpdateForm = ({ initialData }: { initialData: any }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
        birthPlace: initialData?.birthPlace || "",
        neighborhood: initialData?.neighborhood || "",
        phone: initialData?.phone || "",
        avatarUrl: initialData?.avatarUrl || ""
    })

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, avatarUrl: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        startTransition(async () => {
            const result = await updateUserProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
                birthPlace: formData.birthPlace,
                neighborhood: formData.neighborhood,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl,
            })

            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                router.refresh()
                // Auto-hide success after 3s
                setTimeout(() => setSuccess(false), 3000)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-200">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={18} /> Profil mis à jour avec succès. Niveau KYC revu !
                </div>
            )}

            {/* Photo Upload Simulation */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[2rem] relative group overflow-hidden">
                {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-white shadow-inner">
                        <User size={40} />
                    </div>
                )}
                <div className="mt-4 text-center">
                    <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
                        <Camera size={14} /> Choisir une photo
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Nom</label>
                    <input 
                        required 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                        placeholder="Ex: Koné"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Prénoms</label>
                    <input 
                        required 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                        placeholder="Ex: Adama"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Date de naissance</label>
                    <input 
                        required 
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Lieu de naissance</label>
                    <input 
                        required 
                        value={formData.birthPlace}
                        onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                        placeholder="Ex: Abidjan"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Quartier d'habitation</label>
                    <input 
                        required 
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                        placeholder="Ex: Cocody Angré"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Numéro de téléphone</label>
                    <input 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                        placeholder="+225 00000000"
                    />
                </div>
            </div>

            <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Adresse Email (Identifiant)</label>
                <input 
                    readOnly 
                    value={initialData?.email || ""}
                    className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed outline-none" 
                />
            </div>

            <button 
                type="submit" 
                disabled={isPending}
                className="w-full mt-6 py-4 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all disabled:opacity-50 flex justify-center items-center"
            >
                {isPending ? "Mise à jour..." : "Enregistrer et Valider (KYC)"}
            </button>
        </form>
    )
}
