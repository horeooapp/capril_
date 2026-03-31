"use client"

import React, { useState, useTransition } from "react"
import { inviteCollaborator } from "@/actions/agency-team-actions"
import { Plus, CheckCircle2, ShieldAlert, X } from "lucide-react"

// Dictionnaire des permissions possibles (RBAC) pour l'Agence
export const AGENCY_PERMISSIONS = {
    READ_DASHBOARD: "Accès au Tableau de Bord global",
    MANAGE_PROPERTIES: "Gérer le patrimoine (Ajout/Modif de Biens)",
    MANAGE_LEASES: "Gérer les baux et contrats",
    MANAGE_TENANTS: "Communiquer/Gérer les locataires",
    MANAGE_ACCOUNTING: "Accès à la comptabilité (Quittances, Wallet)",
    MANAGE_MANDATES: "Gérer les mandats de gestion",
}

export function CollaboratorInvitationModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [successLink, setSuccessLink] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        email: "",
        permissions: [] as string[]
    })

    const handleTogglePermission = (key: string) => {
        setFormData(prev => {
            const current = [...prev.permissions]
            if (current.includes(key)) return { ...prev, permissions: current.filter(p => p !== key) }
            return { ...prev, permissions: [...current, key] }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessLink(null)

        if (formData.permissions.length === 0) {
            setError("Veuillez sélectionner au moins une permission pour ce collaborateur.")
            return
        }

        startTransition(async () => {
            const res = await inviteCollaborator(formData)
            if (!res.success) {
                setError(res.error || "Une erreur est survenue")
            } else {
                setSuccessLink(res.inviteLink || "")
            }
        })
    }

    const resetAndClose = () => {
        setIsOpen(false)
        setSuccessLink(null)
        setError(null)
        setFormData({ email: "", permissions: [] })
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-qorange hover:bg-qorange-dark text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-[0_8px_16px_rgba(242,104,34,0.2)]"
            >
                <Plus size={18} /> Ajouter un membre
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-qnavy/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={resetAndClose}
                            className="absolute top-6 right-6 p-2 text-qgrey-400 hover:text-qnavy hover:bg-qgrey-50 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-xl flex items-center gap-2 font-black text-qnavy mb-6">
                            <Plus className="text-qorange" /> Inviter un collaborateur
                        </h2>

                {successLink ? (
                    <div className="space-y-6 mt-4">
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="font-bold text-green-800">L'invitation a été générée !</p>
                            <p className="text-sm font-medium text-green-600">
                                Copiez et envoyez ce lien sécurisé à votre collaborateur :
                            </p>
                            <div className="bg-white border-2 border-green-200 border-dashed p-3 rounded-xl break-all">
                                <a href={successLink} target="_blank" className="text-xs font-black text-qnavy hover:underline">
                                    https://qapril.ci{successLink}
                                </a>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={resetAndClose} 
                            className="w-full bg-qnavy hover:bg-qnavy-dark text-white rounded-xl py-4 font-black uppercase tracking-wider transition-colors shadow-lg"
                        >
                            Terminer
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                                <ShieldAlert size={18} /> {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-qgrey-400 pl-2">Email du collaborateur</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="ex: assistant@monagence.com"
                                className="w-full bg-qgrey-50 border border-qgrey-2 rounded-2xl p-4 font-bold text-qnavy focus:ring-2 focus:ring-qorange/30 outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black tracking-widest text-qgrey-400 pl-2 cursor-pointer" onClick={() => {
                                const perms = Object.keys(AGENCY_PERMISSIONS)
                                if (formData.permissions.length === perms.length) setFormData({...formData, permissions: []})
                                else setFormData({...formData, permissions: perms})
                            }}>
                                Fonctionnalités Autorisées
                            </label>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(AGENCY_PERMISSIONS).map(([key, label]) => {
                                    const isSelected = formData.permissions.includes(key)
                                    return (
                                        <div 
                                            key={key}
                                            onClick={() => handleTogglePermission(key)}
                                            className={`p-4 border-2 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                                                isSelected ? "border-qgreen bg-qgreen-pale/30" : "border-qgrey-2 bg-white"
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex justify-center items-center shrink-0 border-2 ${
                                                isSelected ? "bg-qgreen border-qgreen text-white" : "border-qgrey-400 bg-transparent"
                                            }`}>
                                                {isSelected && <CheckCircle2 size={14} />}
                                            </div>
                                            <span className={`text-sm font-bold ${isSelected ? "text-qnavy" : "text-qgrey-400"}`}>
                                                {label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <button 
                            disabled={isPending}
                            type="submit" 
                            className="w-full bg-qnavy hover:bg-qnavy-dark disabled:bg-qgrey-300 text-white rounded-xl py-4 flex justify-center font-black uppercase text-sm tracking-wider shadow-lg transition-colors"
                        >
                            {isPending ? "Génération..." : "Générer le lien d'accès"}
                        </button>
                    </form>
                )}
                    </div>
                </div>
            )}
        </>
    )
}
