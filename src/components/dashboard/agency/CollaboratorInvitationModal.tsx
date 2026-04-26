"use client"

import React, { useState, useTransition } from "react"
import { inviteCollaborator } from "@/actions/agency-team-actions"
import { Plus, CheckCircle2, ShieldAlert, X, Briefcase } from "lucide-react"

export const POSTES_AGENCE = {
    MANAGER_ADJOINT: {
        label: "Manager Adjoint",
        description: "Accès total à tous les modules de l'agence (Superviseur)",
        permissions: ["READ_DASHBOARD", "MANAGE_PROPERTIES", "MANAGE_LEASES", "MANAGE_TENANTS", "MANAGE_ACCOUNTING", "MANAGE_MANDATES"]
    },
    GESTIONNAIRE_LOCATIF: {
        label: "Gestionnaire Locatif",
        description: "Gestion quotidienne des biens, baux, mandats et locataires",
        permissions: ["READ_DASHBOARD", "MANAGE_PROPERTIES", "MANAGE_LEASES", "MANAGE_TENANTS", "MANAGE_MANDATES"]
    },
    COMPTABLE: {
        label: "Comptable",
        description: "Gestion financière, suivi des loyers, quittances et wallet",
        permissions: ["READ_DASHBOARD", "MANAGE_ACCOUNTING"]
    },
    AGENT_TERRAIN: {
        label: "Agent Terrain",
        description: "Interventions physiques (Visites, États des Lieux, Maintenance)",
        permissions: ["READ_DASHBOARD", "MANAGE_PROPERTIES", "MANAGE_TENANTS"]
    }
}

export function CollaboratorInvitationModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [successLink, setSuccessLink] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        email: "",
        poste: "GESTIONNAIRE_LOCATIF" // Par défaut
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessLink(null)

        const selectedPoste = POSTES_AGENCE[formData.poste as keyof typeof POSTES_AGENCE]
        if (!selectedPoste) {
            setError("Veuillez sélectionner un poste valide.")
            return
        }

        startTransition(async () => {
            const res = await inviteCollaborator({
                email: formData.email,
                poste: formData.poste,
                permissions: selectedPoste.permissions
            })
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
        setFormData({ email: "", poste: "GESTIONNAIRE_LOCATIF" })
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
                            className="absolute top-6 right-6 p-2 text-qgrey-4 hover:text-qnavy hover:bg-qgrey-1 rounded-full transition-colors"
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
                            <label className="text-[10px] uppercase font-black tracking-widest text-qgrey-4 pl-2">Email du collaborateur</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="ex: jean@monagence.com"
                                className="w-full bg-qgrey-1 border border-qgrey-2 rounded-2xl p-4 font-bold text-qnavy focus:ring-2 focus:ring-qorange/30 outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black tracking-widest text-qgrey-400 pl-2 flex items-center gap-2">
                                <Briefcase size={14} /> Attribuer un Poste
                            </label>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(POSTES_AGENCE).map(([key, data]) => {
                                    const isSelected = formData.poste === key
                                    return (
                                        <div 
                                            key={key}
                                            onClick={() => setFormData({...formData, poste: key})}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                isSelected ? "border-qorange bg-orange-50/50 shadow-sm" : "border-qgrey-2 bg-white hover:border-qgrey-3"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded-full flex justify-center items-center shrink-0 border-2 transition-colors ${
                                                    isSelected ? "bg-qorange border-qorange text-white" : "border-qgrey-4 bg-transparent"
                                                }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <div>
                                                    <span className={`block text-sm font-black uppercase tracking-wider ${isSelected ? "text-qorange" : "text-qnavy"}`}>
                                                        {data.label}
                                                    </span>
                                                    <p className={`text-xs mt-1 ${isSelected ? "text-orange-800/70" : "text-qgrey-4"}`}>
                                                        {data.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <button 
                            disabled={isPending}
                            type="submit" 
                            className="w-full bg-qnavy hover:bg-qnavy-dark disabled:bg-qgrey-3 text-white rounded-xl py-4 flex justify-center font-black uppercase text-sm tracking-wider shadow-lg transition-colors"
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
