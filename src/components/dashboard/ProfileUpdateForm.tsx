"use client"

import React, { useState, useTransition } from "react"
import { updateUserProfile } from "@/actions/profile"
import { CheckCircle2, User, Camera, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export const ProfileUpdateForm = ({ initialData, isIdentityLocked = false, activeRole }: { initialData: any, isIdentityLocked?: boolean, activeRole?: string }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const isAgency = activeRole === "AGENCY";

    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
        birthPlace: initialData?.birthPlace || "",
        neighborhood: initialData?.neighborhood || "",
        profession: initialData?.profession || "",
        salary: initialData?.salary || "",
        phone: initialData?.phone || "",
        avatarUrl: initialData?.avatarUrl || "",
        docType: initialData?.docType || "CNI_CI",
        docNumber: initialData?.docNumber || "",
        // Agency
        dfe: initialData?.dfe || "",
        rccm: initialData?.rccm || "",
        nif: initialData?.nif || "",
        agrement: initialData?.agrement || ""
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
                profession: formData.profession,
                salary: formData.salary ? parseFloat(formData.salary.toString()) : null,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl,
                docType: formData.docType,
                docNumber: formData.docNumber,
                isAgency,
                dfe: formData.dfe,
                rccm: formData.rccm,
                nif: formData.nif,
                agrement: formData.agrement
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

            {isIdentityLocked && (
                <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl text-[11px] uppercase tracking-widest font-black flex items-center gap-2 border border-orange-200 shadow-sm animate-in fade-in">
                    <ShieldCheck size={18} /> Identité verrouillée par un contrat de bail. Modification interdite.
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

            <div className={`grid grid-cols-1 ${isAgency ? '' : 'md:grid-cols-2'} gap-6`}>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">
                        {isAgency ? "Nom de l'entreprise / Agence" : "Nom"}
                    </label>
                    <input 
                        required 
                        readOnly={isIdentityLocked}
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed" 
                        placeholder={isAgency ? "Ex: QAPRIL IMMOBILIER" : "Ex: Koné"}
                    />
                </div>
                {!isAgency && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Prénoms</label>
                        <input 
                            required 
                            readOnly={isIdentityLocked}
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed" 
                            placeholder="Ex: Adama"
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Date de naissance</label>
                    <input 
                        required 
                        readOnly={isIdentityLocked}
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Lieu de naissance</label>
                    <input 
                        required 
                        readOnly={isIdentityLocked}
                        value={formData.birthPlace}
                        onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed" 
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
                {!isAgency && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Profession</label>
                        <input 
                            required 
                            readOnly={isIdentityLocked}
                            value={formData.profession}
                            onChange={(e) => setFormData({...formData, profession: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed" 
                            placeholder="Ex: Comptable"
                        />
                    </div>
                )}
                {!isAgency && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Salaire / Revenu Mensuel (Optionnel)</label>
                        <input 
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData({...formData, salary: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                            placeholder="Ex: 500000"
                        />
                    </div>
                )}
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

            {!isAgency ? (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79] flex items-center gap-2">
                        <ShieldCheck size={16} /> Pièce d'Identité (Obligatoire KYC 2)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Type de Document</label>
                            <select 
                                required
                                disabled={isIdentityLocked}
                                value={formData.docType}
                                onChange={(e) => setFormData({...formData, docType: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
                            >
                                <option value="CNI_CI">Carte Nationale d'Identité (CNI)</option>
                                <option value="PASS_CI">Passeport</option>
                                <option value="ATTESTATION">Attestation d'Identité</option>
                                <option value="PERMIS">Permis de Conduire</option>
                                <option value="CARTE_CONSULAIRE">Carte Consulaire</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Numéro de la pièce</label>
                            <input 
                                required 
                                readOnly={isIdentityLocked}
                                value={formData.docNumber}
                                onChange={(e) => setFormData({...formData, docNumber: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none readOnly:opacity-60 readOnly:cursor-not-allowed readOnly:bg-gray-50" 
                                placeholder="Ex: CI000000000"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79] flex items-center gap-2">
                        <ShieldCheck size={16} /> Documents d'Entreprise (Obligatoire KYC 2)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Numéro DFE</label>
                            <input 
                                required 
                                value={formData.dfe}
                                onChange={(e) => setFormData({...formData, dfe: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                                placeholder="Déclaration Fiscale d'Existence"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Numéro RCCM</label>
                            <input 
                                required 
                                value={formData.rccm}
                                onChange={(e) => setFormData({...formData, rccm: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                                placeholder="Registre de Commerce"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Compte Contribuable (NIF)</label>
                            <input 
                                required 
                                value={formData.nif}
                                onChange={(e) => setFormData({...formData, nif: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                                placeholder="N° Compte Contribuable"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Numéro d'Agrément</label>
                            <input 
                                required 
                                value={formData.agrement}
                                onChange={(e) => setFormData({...formData, agrement: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-[#1F4E79] outline-none" 
                                placeholder="N° Agrément Ministériel"
                            />
                        </div>
                    </div>
                </div>
            )}

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
